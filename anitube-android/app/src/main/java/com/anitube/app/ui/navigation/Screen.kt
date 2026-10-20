package com.anitube.app.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Home : Screen("home", "Home")
    object Discover : Screen("discover", "Discover")
    object Schedule : Screen("schedule", "Schedule")
    object Search : Screen("search", "Search")
    object Watchlist : Screen("watchlist", "Watchlist")
    object Profile : Screen("profile", "Profile")
    object Details : Screen("details/{animeId}", "Details") {
        fun createRoute(animeId: Int) = "details/$animeId"
    }
}
