package com.anitube.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.anitube.app.domain.model.WatchProgress

@Entity(tableName = "watch_history")
data class WatchHistoryEntity(
    @PrimaryKey
    val episodeId: String,
    val animeId: Int,
    val animeTitle: String,
    val animeCover: String?,
    val episodeNumber: Int,
    val episodeTitle: String?,
    val currentPositionMs: Long,
    val durationMs: Long,
    val lastWatchedTimestamp: Long
) {
    fun toDomain() = WatchProgress(
        animeId = animeId,
        animeTitle = animeTitle,
        animeCover = animeCover,
        episodeId = episodeId,
        episodeNumber = episodeNumber,
        episodeTitle = episodeTitle,
        currentPositionMs = currentPositionMs,
        durationMs = durationMs,
        lastWatchedTimestamp = lastWatchedTimestamp
    )
}

@Entity(tableName = "watchlist")
data class WatchlistEntity(
    @PrimaryKey
    val animeId: Int,
    val title: String,
    val coverImage: String?,
    val format: String?,
    val score: Int?,
    val totalEpisodes: Int?,
    val addedAtTimestamp: Long = System.currentTimeMillis()
)
