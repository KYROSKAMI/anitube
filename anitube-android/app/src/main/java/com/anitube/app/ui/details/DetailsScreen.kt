package com.anitube.app.ui.details

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.anitube.app.core.designsystem.AnitubeCrimson
import com.anitube.app.core.designsystem.DarkBackground
import com.anitube.app.core.designsystem.DarkSurfaceVariant
import com.anitube.app.domain.model.Anime
import com.anitube.app.domain.model.Episode
import com.anitube.app.player.AnitubePlayerController
import com.anitube.app.ui.player.PlayerScreen

@Composable
fun DetailsScreen(
    anime: Anime,
    episodes: List<Episode>,
    isLoadingEpisodes: Boolean,
    isInWatchlist: Boolean,
    playerController: AnitubePlayerController,
    onToggleWatchlist: () -> Unit,
    onPlayEpisode: (Episode) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedAudio by remember { mutableStateOf("sub") }
    val playerState by playerController.uiState.collectAsState()
    val isPlayingThisAnime = playerState.anime?.id == anime.id && playerState.currentEpisode != null

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // Top Player Section: Compact 16:9 Inline Player when active, or Hero Banner
        item {
            if (isPlayingThisAnime && !playerState.isFullScreen) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(16f / 9f)
                        .background(Color.Black)
                ) {
                    PlayerScreen(
                        controller = playerController,
                        onMinimize = { playerController.minimizeToMiniPlayer() },
                        modifier = Modifier.fillMaxSize()
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp)
                ) {
                    AsyncImage(
                        model = anime.bannerImage ?: anime.coverImage,
                        contentDescription = null,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )

                    IconButton(
                        onClick = onBack,
                        modifier = Modifier
                            .statusBarsPadding()
                            .padding(8.dp)
                            .background(Color.Black.copy(alpha = 0.5f), shape = RoundedCornerShape(20.dp))
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                }
            }
        }

        // Title and actions
        item {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = anime.displayTitle,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    anime.averageScore?.let {
                        AssistChip(
                            onClick = {},
                            label = { Text("Score: $it%", color = Color.White) },
                            leadingIcon = { Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFFFB800)) }
                        )
                    }
                    anime.seasonYear?.let {
                        AssistChip(
                            onClick = {},
                            label = { Text("$it", color = Color.White) }
                        )
                    }
                    anime.status?.let {
                        AssistChip(
                            onClick = {},
                            label = { Text(it, color = Color.White) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Button(
                        onClick = {
                            val firstEp = episodes.firstOrNull()
                            if (firstEp != null) onPlayEpisode(firstEp)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AnitubeCrimson),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (isPlayingThisAnime) "Watching" else "Watch Ep 1")
                    }

                    OutlinedButton(
                        onClick = onToggleWatchlist,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(
                            imageVector = if (isInWatchlist) Icons.Default.BookmarkAdded else Icons.Default.BookmarkBorder,
                            contentDescription = null,
                            tint = if (isInWatchlist) AnitubeCrimson else Color.White
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (isInWatchlist) "In Watchlist" else "Watchlist", color = Color.White)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Description
                Text(
                    text = anime.description ?: "No description provided.",
                    fontSize = 13.sp,
                    color = Color.White.copy(alpha = 0.8f),
                    lineHeight = 18.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Audio selector: Sub / Dub
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Episodes (${episodes.size})",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    SingleChoiceSegmentedButtonRow {
                        SegmentedButton(
                            selected = selectedAudio == "sub",
                            onClick = { selectedAudio = "sub" },
                            shape = SegmentedButtonDefaults.itemShape(index = 0, count = 2)
                        ) {
                            Text("SUB")
                        }
                        SegmentedButton(
                            selected = selectedAudio == "dub",
                            onClick = { selectedAudio = "dub" },
                            shape = SegmentedButtonDefaults.itemShape(index = 1, count = 2)
                        ) {
                            Text("DUB")
                        }
                    }
                }
            }
        }

        // Episodes list underneath inline player
        if (isLoadingEpisodes) {
            item {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = AnitubeCrimson)
                }
            }
        } else if (episodes.isEmpty()) {
            item {
                Text(
                    text = "No episodes currently available for this selection.",
                    color = Color.White.copy(alpha = 0.6f),
                    modifier = Modifier.padding(16.dp)
                )
            }
        } else {
            items(episodes) { ep ->
                val isSelected = playerState.currentEpisode?.id == ep.id
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 5.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) AnitubeCrimson.copy(alpha = 0.2f) else DarkSurfaceVariant)
                        .clickable { onPlayEpisode(ep) }
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = ep.thumbnail ?: anime.coverImage,
                        contentDescription = null,
                        modifier = Modifier
                            .size(width = 80.dp, height = 48.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        contentScale = ContentScale.Crop
                    )

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Episode ${ep.number}: ${ep.title ?: ""}",
                                color = if (isSelected) AnitubeCrimson else Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                        ep.durationSeconds?.let {
                            Text(
                                text = "${it / 60}m",
                                color = Color.White.copy(alpha = 0.5f),
                                fontSize = 11.sp
                            )
                        }
                    }

                    Icon(
                        imageVector = if (isSelected && playerState.isPlaying) Icons.Default.PauseCircle else Icons.Default.PlayCircle,
                        contentDescription = "Play",
                        tint = AnitubeCrimson,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}
