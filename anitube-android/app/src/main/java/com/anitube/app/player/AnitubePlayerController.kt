package com.anitube.app.player

import android.content.Context
import androidx.annotation.OptIn
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import com.anitube.app.data.local.AnitubeDatabase
import com.anitube.app.data.local.WatchHistoryEntity
import com.anitube.app.data.repository.StreamingRepository
import com.anitube.app.domain.model.Anime
import com.anitube.app.domain.model.Episode
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

@OptIn(UnstableApi::class)
class AnitubePlayerController private constructor(
    private val context: Context,
    private val streamingRepo: StreamingRepository,
    private val database: AnitubeDatabase
) : Player.Listener {

    private val scope = CoroutineScope(Dispatchers.Main + Job())
    private var progressJob: Job? = null
    private var watchdogJob: Job? = null

    // Configure low-latency, resilient LoadControl
    private val loadControl = DefaultLoadControl.Builder()
        .setBufferDurationsMs(
            15000, // min buffer 15s
            50000, // max buffer 50s
            2000,  // buffer for playback 2s
            4000   // buffer for rebuffer 4s
        )
        .build()

    // Base HTTP data source factory with standard desktop/mobile headers to avoid 403 blocks
    private fun createHttpDataSource(referer: String): DefaultHttpDataSource.Factory {
        return DefaultHttpDataSource.Factory()
            .setUserAgent("Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36")
            .setDefaultRequestProperties(
                mapOf(
                    "Referer" to referer,
                    "Origin" to referer.removeSuffix("/"),
                    "Accept" to "*/*"
                )
            )
            .setConnectTimeoutMs(15000)
            .setReadTimeoutMs(15000)
            .setAllowCrossProtocolRedirects(true)
    }

    val exoPlayer: ExoPlayer by lazy {
        ExoPlayer.Builder(context)
            .setLoadControl(loadControl)
            .build().apply {
                addListener(this@AnitubePlayerController)
                playWhenReady = true
                videoScalingMode = C.VIDEO_SCALING_MODE_SCALE_TO_FIT
            }
    }

    private val _uiState = MutableStateFlow(PlayerUiState())
    val uiState: StateFlow<PlayerUiState> = _uiState.asStateFlow()

    init {
        startProgressTracker()
    }

    /**
     * Starts playback in YouTube-style inline player by default (isFullScreen = false).
     */
    fun playEpisode(anime: Anime, episode: Episode, allEpisodes: List<Episode> = emptyList(), fullscreen: Boolean = false) {
        _uiState.update {
            it.copy(
                anime = anime,
                currentEpisode = episode,
                episodeList = allEpisodes,
                isBuffering = true,
                errorMessage = null,
                isMiniPlayerActive = false,
                isFullScreen = fullscreen
            )
        }

        // Arm watchdog timer: if buffering doesn't resolve within 8s, surface friendly retry
        watchdogJob?.cancel()
        watchdogJob = scope.launch {
            delay(8000)
            if (_uiState.value.isBuffering && !exoPlayer.isPlaying) {
                _uiState.update {
                    it.copy(
                        isBuffering = false,
                        errorMessage = "Stream took too long to load. Tap to retry."
                    )
                }
            }
        }

        scope.launch {
            val savedProgress = database.watchHistoryDao().getProgressForEpisode(episode.id)
            val startMs = savedProgress?.currentPositionMs ?: 0L

            val result = streamingRepo.resolveStream(episode)
            result.onSuccess { streamSource ->
                _uiState.update { it.copy(streamSource = streamSource, isBuffering = false) }

                val streamUrl = streamSource.streamUrl
                val referer = when {
                    streamUrl.contains("flixcloud") -> "https://flixcloud.cc/"
                    streamUrl.contains("krussdomi") -> "https://krussdomi.com/"
                    else -> "https://anizone.to/"
                }

                val httpSource = createHttpDataSource(referer)
                val mediaItem = MediaItem.Builder()
                    .setUri(streamUrl)
                    .setMimeType(if (streamUrl.contains(".m3u8")) MimeTypes.APPLICATION_M3U8 else MimeTypes.APPLICATION_MP4)
                    .build()

                val mediaSource = HlsMediaSource.Factory(httpSource)
                    .setAllowChunklessPreparation(true)
                    .createMediaSource(mediaItem)

                exoPlayer.setMediaSource(mediaSource)
                if (startMs > 0L) {
                    exoPlayer.seekTo(startMs)
                }
                exoPlayer.prepare()
                exoPlayer.play()
            }.onFailure {
                _uiState.update {
                    it.copy(
                        isBuffering = false,
                        errorMessage = "Stream could not be reached. Please check your network and try again."
                    )
                }
            }
        }
    }

    fun togglePlayPause() {
        if (exoPlayer.isPlaying) {
            exoPlayer.pause()
        } else {
            exoPlayer.play()
        }
    }

    fun seekTo(positionMs: Long) {
        exoPlayer.seekTo(positionMs)
        _uiState.update { it.copy(currentPositionMs = positionMs) }
    }

    fun setSpeed(speed: Float) {
        exoPlayer.setPlaybackSpeed(speed)
        _uiState.update { it.copy(playbackSpeed = speed) }
    }

    fun toggleFullscreen() {
        _uiState.update { it.copy(isFullScreen = !it.isFullScreen) }
    }

    fun exitFullscreen() {
        _uiState.update { it.copy(isFullScreen = false) }
    }

    fun enterFullscreen() {
        _uiState.update { it.copy(isFullScreen = true) }
    }

    fun minimizeToMiniPlayer() {
        _uiState.update { it.copy(isMiniPlayerActive = true, isFullScreen = false) }
    }

    fun expandFromMiniPlayer() {
        _uiState.update { it.copy(isMiniPlayerActive = false, isFullScreen = false) }
    }

    fun closeMiniPlayer() {
        exoPlayer.stop()
        persistCurrentProgress()
        _uiState.update {
            it.copy(
                isMiniPlayerActive = false,
                isFullScreen = false,
                anime = null,
                currentEpisode = null,
                streamSource = null
            )
        }
    }

    fun playNextEpisode() {
        val current = _uiState.value.currentEpisode ?: return
        val list = _uiState.value.episodeList
        val nextEp = list.find { it.number == current.number + 1 }
        val anime = _uiState.value.anime ?: return
        if (nextEp != null) {
            playEpisode(anime, nextEp, list, _uiState.value.isFullScreen)
        }
    }

    fun playPreviousEpisode() {
        val current = _uiState.value.currentEpisode ?: return
        val list = _uiState.value.episodeList
        val prevEp = list.find { it.number == current.number - 1 }
        val anime = _uiState.value.anime ?: return
        if (prevEp != null) {
            playEpisode(anime, prevEp, list, _uiState.value.isFullScreen)
        }
    }

    private fun startProgressTracker() {
        progressJob?.cancel()
        progressJob = scope.launch {
            while (isActive) {
                if (exoPlayer.isPlaying) {
                    val pos = exoPlayer.currentPosition
                    val dur = exoPlayer.duration.coerceAtLeast(0L)
                    _uiState.update {
                        it.copy(currentPositionMs = pos, durationMs = dur)
                    }
                    if (pos > 0 && pos % 5000 < 500) {
                        persistCurrentProgress()
                    }
                }
                delay(400)
            }
        }
    }

    private fun persistCurrentProgress() {
        val state = _uiState.value
        val anime = state.anime ?: return
        val episode = state.currentEpisode ?: return
        val pos = state.currentPositionMs
        val dur = state.durationMs
        if (dur <= 0) return

        scope.launch(Dispatchers.IO) {
            database.watchHistoryDao().saveProgress(
                WatchHistoryEntity(
                    episodeId = episode.id,
                    animeId = anime.id,
                    animeTitle = anime.displayTitle,
                    animeCover = anime.coverImage,
                    episodeNumber = episode.number,
                    episodeTitle = episode.title,
                    currentPositionMs = pos,
                    durationMs = dur,
                    lastWatchedTimestamp = System.currentTimeMillis()
                )
            )
        }
    }

    override fun onIsPlayingChanged(isPlaying: Boolean) {
        _uiState.update { it.copy(isPlaying = isPlaying) }
        if (isPlaying) {
            watchdogJob?.cancel()
            _uiState.update { it.copy(isBuffering = false) }
        } else {
            persistCurrentProgress()
        }
    }

    override fun onPlaybackStateChanged(playbackState: Int) {
        when (playbackState) {
            Player.STATE_BUFFERING -> _uiState.update { it.copy(isBuffering = true) }
            Player.STATE_READY -> {
                watchdogJob?.cancel()
                _uiState.update {
                    it.copy(
                        isBuffering = false,
                        durationMs = exoPlayer.duration.coerceAtLeast(0L)
                    )
                }
            }
            Player.STATE_ENDED -> {
                _uiState.update { it.copy(isPlaying = false) }
                playNextEpisode()
            }
            Player.STATE_IDLE -> Unit
        }
    }

    override fun onPlayerError(error: PlaybackException) {
        watchdogJob?.cancel()
        _uiState.update {
            it.copy(
                isBuffering = false,
                errorMessage = "Playback interrupted. Tap to retry."
            )
        }
    }

    companion object {
        @Volatile
        private var INSTANCE: AnitubePlayerController? = null

        fun getInstance(context: Context): AnitubePlayerController {
            return INSTANCE ?: synchronized(this) {
                val db = AnitubeDatabase.getDatabase(context)
                val repo = StreamingRepository()
                val instance = AnitubePlayerController(context.applicationContext, repo, db)
                INSTANCE = instance
                instance
            }
        }
    }
}
