package com.anitube.app.player

import com.anitube.app.domain.model.Anime
import com.anitube.app.domain.model.Episode
import com.anitube.app.domain.model.StreamSource

data class PlayerUiState(
    val anime: Anime? = null,
    val currentEpisode: Episode? = null,
    val episodeList: List<Episode> = emptyList(),
    val streamSource: StreamSource? = null,
    val isPlaying: Boolean = false,
    val isBuffering: Boolean = false,
    val currentPositionMs: Long = 0L,
    val durationMs: Long = 0L,
    val playbackSpeed: Float = 1.0f,
    val isMiniPlayerActive: Boolean = false,
    val isFullScreen: Boolean = false,
    val errorMessage: String? = null,
    val selectedAudio: String = "sub"
) {
    val progressFraction: Float
        get() = if (durationMs > 0) (currentPositionMs.toFloat() / durationMs.toFloat()).coerceIn(0f, 1f) else 0f
}
