package com.anitube.app.domain.model

data class Anime(
    val id: Int,
    val title: AnimeTitle,
    val coverImage: String?,
    val bannerImage: String?,
    val description: String?,
    val genres: List<String> = emptyList(),
    val averageScore: Int? = null,
    val episodes: Int? = null,
    val format: String? = null,
    val seasonYear: Int? = null,
    val status: String? = null
) {
    val displayTitle: String
        get() = title.english ?: title.romaji ?: title.nativeTitle ?: "Anime #$id"
}

data class AnimeTitle(
    val romaji: String?,
    val english: String?,
    val nativeTitle: String?
)

data class Episode(
    val id: String, // e.g. "watch/reanime/16498/sub/reanime-1"
    val number: Int,
    val title: String?,
    val thumbnail: String?,
    val audio: String = "sub", // "sub" or "dub"
    val durationSeconds: Int? = null,
    val isFiller: Boolean = false,
    val description: String? = null
)

data class StreamSource(
    val animeTitle: String?,
    val episodeNumber: Int,
    val audio: String,
    val streamUrl: String,
    val serverName: String?,
    val subtitles: List<SubtitleTrack> = emptyList(),
    val introStart: Int? = null,
    val introEnd: Int? = null,
    val outroStart: Int? = null,
    val outroEnd: Int? = null
)

data class SubtitleTrack(
    val url: String,
    val language: String,
    val format: String,
    val isDefault: Boolean = false
)

data class WatchProgress(
    val animeId: Int,
    val animeTitle: String,
    val animeCover: String?,
    val episodeId: String,
    val episodeNumber: Int,
    val episodeTitle: String?,
    val currentPositionMs: Long,
    val durationMs: Long,
    val lastWatchedTimestamp: Long = System.currentTimeMillis()
) {
    val progressFraction: Float
        get() = if (durationMs > 0) (currentPositionMs.toFloat() / durationMs.toFloat()).coerceIn(0f, 1f) else 0f
}
