package com.anitube.app

import com.anitube.app.domain.model.WatchProgress
import org.junit.Assert.assertEquals
import org.junit.Test

class WatchHistoryPersistenceTest {

    @Test
    fun testWatchProgressFractionCalculation() {
        val progress = WatchProgress(
            animeId = 16498,
            animeTitle = "Attack on Titan",
            animeCover = null,
            episodeId = "watch/reanime/16498/sub/reanime-1",
            episodeNumber = 1,
            episodeTitle = "Pilot",
            currentPositionMs = 600000L,
            durationMs = 1200000L
        )

        assertEquals(0.5f, progress.progressFraction, 0.001f)
    }
}
