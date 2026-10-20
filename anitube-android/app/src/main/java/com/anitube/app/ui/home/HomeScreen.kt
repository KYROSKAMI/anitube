package com.anitube.app.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.anitube.app.core.designsystem.AnitubeCrimson
import com.anitube.app.core.designsystem.DarkBackground
import com.anitube.app.core.designsystem.DarkSurface
import com.anitube.app.core.designsystem.GoldStar
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import com.anitube.app.domain.model.Anime

@Composable
fun HomeScreen(
    trendingAnime: List<Anime>,
    popularAnime: List<Anime>,
    isLoading: Boolean,
    onAnimeClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    if (isLoading) {
        Box(modifier = modifier.fillMaxSize().background(DarkBackground), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = AnitubeCrimson)
        }
        return
    }

    val featuredList = remember(trendingAnime, popularAnime) {
        (trendingAnime + popularAnime).distinctBy { it.id }.take(6)
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // Featured Swipeable Hero Carousel
        if (featuredList.isNotEmpty()) {
            item {
                val pagerState = rememberPagerState(pageCount = { featuredList.size })

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(420.dp)
                ) {
                    HorizontalPager(
                        state = pagerState,
                        modifier = Modifier.fillMaxSize()
                    ) { page ->
                        val item = featuredList[page]
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .clickable { onAnimeClick(item.id) }
                        ) {
                            AsyncImage(
                                model = item.bannerImage ?: item.coverImage,
                                contentDescription = item.displayTitle,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )

                            // Gradient scrim
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(
                                        Brush.verticalGradient(
                                            colors = listOf(
                                                Color.Transparent,
                                                DarkBackground.copy(alpha = 0.6f),
                                                DarkBackground
                                            ),
                                            startY = 100f
                                        )
                                    )
                            )

                            // Content overlay
                            Column(
                                modifier = Modifier
                                    .align(Alignment.BottomStart)
                                    .padding(16.dp)
                            ) {
                                Surface(
                                    color = AnitubeCrimson,
                                    shape = RoundedCornerShape(4.dp),
                                    modifier = Modifier.padding(bottom = 6.dp)
                                ) {
                                    Text(
                                        text = if (page == 0) "#1 TRENDING" else "#${page + 1} SPOTLIGHT",
                                        color = Color.White,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Black,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }

                                Text(
                                    text = item.displayTitle,
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.White,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )

                                Spacer(modifier = Modifier.height(6.dp))

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    if (item.averageScore != null) {
                                        Icon(
                                            imageVector = Icons.Default.Star,
                                            contentDescription = null,
                                            tint = GoldStar,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "${item.averageScore}%",
                                            color = Color.White,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp
                                        )
                                        Spacer(modifier = Modifier.width(12.dp))
                                    }
                                    Text(
                                        text = item.genres.take(3).joinToString(" • "),
                                        color = Color.White.copy(alpha = 0.8f),
                                        fontSize = 12.sp
                                    )
                                }

                                Spacer(modifier = Modifier.height(14.dp))

                                Button(
                                    onClick = { onAnimeClick(item.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = AnitubeCrimson),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Watch Now", fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    // Centered Clean Indicators
                    Row(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 12.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        repeat(featuredList.size) { iteration ->
                            val isSelected = pagerState.currentPage == iteration
                            Box(
                                modifier = Modifier
                                    .width(if (isSelected) 22.dp else 6.dp)
                                    .height(5.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(if (isSelected) AnitubeCrimson else Color.White.copy(alpha = 0.4f))
                            )
                        }
                    }
                }
            }
        }

        // Trending Section
        item {
            AnimeSection(
                title = "Trending Now",
                animeList = trendingAnime,
                onAnimeClick = onAnimeClick
            )
        }

        // Popular Section
        item {
            AnimeSection(
                title = "Popular on Anitube",
                animeList = popularAnime,
                onAnimeClick = onAnimeClick
            )
        }

        item {
            Spacer(modifier = Modifier.height(80.dp)) // padding for mini-player
        }
    }
}

@Composable
fun AnimeSection(
    title: String,
    animeList: List<Anime>,
    onAnimeClick: (Int) -> Unit
) {
    Column(modifier = Modifier.padding(vertical = 12.dp)) {
        Text(
            text = title,
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )

        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(animeList) { anime ->
                Column(
                    modifier = Modifier
                        .width(130.dp)
                        .clickable { onAnimeClick(anime.id) }
                ) {
                    AsyncImage(
                        model = anime.coverImage,
                        contentDescription = anime.displayTitle,
                        modifier = Modifier
                            .height(185.dp)
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp)),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = anime.displayTitle,
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}
