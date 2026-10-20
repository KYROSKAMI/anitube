package com.anitube.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.anitube.app.core.designsystem.AnitubeCrimson
import com.anitube.app.core.designsystem.AnitubeTheme
import com.anitube.app.core.designsystem.DarkBackground
import com.anitube.app.core.designsystem.DarkSurface
import com.anitube.app.core.network.AniListGraphQLClient
import com.anitube.app.domain.model.Anime
import com.anitube.app.player.AnitubePlayerController
import com.anitube.app.ui.components.MiniPlayer
import com.anitube.app.ui.home.HomeScreen
import com.anitube.app.ui.schedule.ScheduleScreen
import com.anitube.app.ui.navigation.Screen
import com.anitube.app.ui.player.PlayerScreen
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val playerController = AnitubePlayerController.getInstance(this)
        val aniListClient = AniListGraphQLClient()

        setContent {
            AnitubeTheme {
                val navController = rememberNavController()
                val playerState by playerController.uiState.collectAsState()
                var currentRoute by remember { mutableStateOf("home") }

                var trendingList by remember { mutableStateOf<List<Anime>>(emptyList()) }
                var popularList by remember { mutableStateOf<List<Anime>>(emptyList()) }
                var isLoadingHome by remember { mutableStateOf(true) }

                val scope = rememberCoroutineScope()

                LaunchedEffect(Unit) {
                    scope.launch {
                        aniListClient.getTrendingAnime(20).onSuccess { trendingList = it }
                        aniListClient.getPopularAnime(20).onSuccess { popularList = it }
                        isLoadingHome = false
                    }
                }

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(DarkBackground)
                ) {
                    Scaffold(
                        bottomBar = {
                            if (!playerState.isFullScreen) {
                                Column {
                                    // Persistent Mini Player docked above BottomNav
                                    MiniPlayer(
                                        playerState = playerState,
                                        onExpand = { playerController.expandFromMiniPlayer() },
                                        onTogglePlayPause = { playerController.togglePlayPause() },
                                        onClose = { playerController.closeMiniPlayer() }
                                    )

                                    NavigationBar(
                                        containerColor = DarkSurface,
                                        contentColor = Color.White
                                    ) {
                                        listOf(
                                            NavigationItem(Screen.Home.route, "Home", Icons.Default.Home),
                                            NavigationItem(Screen.Discover.route, "Discover", Icons.Default.Explore),
                                            NavigationItem(Screen.Schedule.route, "Schedule", Icons.Default.CalendarToday),
                                            NavigationItem(Screen.Watchlist.route, "Watchlist", Icons.Default.Bookmark),
                                            NavigationItem(Screen.Profile.route, "Profile", Icons.Default.Person)
                                        ).forEach { item ->
                                            NavigationBarItem(
                                                selected = currentRoute == item.route,
                                                onClick = {
                                                    currentRoute = item.route
                                                    navController.navigate(item.route) {
                                                        popUpTo(Screen.Home.route) { saveState = true }
                                                        launchSingleTop = true
                                                        restoreState = true
                                                    }
                                                },
                                                icon = { Icon(item.icon, contentDescription = item.label) },
                                                label = { Text(item.label) },
                                                colors = NavigationBarItemDefaults.colors(
                                                    selectedIconColor = AnitubeCrimson,
                                                    selectedTextColor = AnitubeCrimson,
                                                    indicatorColor = DarkSurface
                                                )
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    ) { innerPadding ->
                        NavHost(
                            navController = navController,
                            startDestination = Screen.Home.route,
                            modifier = Modifier.padding(innerPadding)
                        ) {
                            composable(Screen.Home.route) {
                                HomeScreen(
                                    trendingAnime = trendingList,
                                    popularAnime = popularList,
                                    isLoading = isLoadingHome,
                                    onAnimeClick = { animeId ->
                                        // Navigate to details or trigger playback
                                    }
                                )
                            }
                            composable(Screen.Discover.route) {
                                // Discover screen
                            }
                            composable(Screen.Schedule.route) {
                                ScheduleScreen(
                                    onAnimeClick = { animeId ->
                                        // Navigate to details or trigger playback
                                    }
                                )
                            }
                            composable(Screen.Search.route) {
                                // Search screen
                            }
                            composable(Screen.Watchlist.route) {
                                // Watchlist screen
                            }
                            composable(Screen.Profile.route) {
                                // Profile screen
                            }
                        }
                    }

                    // Full Screen Player Overlay
                    if (playerState.isFullScreen) {
                        PlayerScreen(
                            controller = playerController,
                            onMinimize = { playerController.minimizeToMiniPlayer() }
                        )
                    }
                }
            }
        }
    }
}

data class NavigationItem(val route: String, val label: String, val icon: ImageVector)
