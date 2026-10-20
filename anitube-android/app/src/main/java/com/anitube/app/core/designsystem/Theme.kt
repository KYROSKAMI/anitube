package com.anitube.app.core.designsystem

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val AnitubeColorScheme = darkColorScheme(
    primary = AnitubeCrimson,
    onPrimary = TextPrimary,
    primaryContainer = AnitubeCrimsonDark,
    background = DarkBackground,
    onBackground = TextPrimary,
    surface = DarkSurface,
    onSurface = TextPrimary,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = TextSecondary,
    outline = DarkBorder
)

@Composable
fun AnitubeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = AnitubeColorScheme,
        content = content
    )
}
