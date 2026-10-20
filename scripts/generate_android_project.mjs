import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = path.resolve('anitube-android');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(relPath, content) {
  const fullPath = path.join(rootDir, relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`Created: ${relPath}`);
}

console.log('Generating complete Anitube Native Android codebase...');

// 1. settings.gradle.kts
writeFile('settings.gradle.kts', `
pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://jitpack.io") }
    }
}

rootProject.name = "Anitube"
include(":app")
`);

// 2. build.gradle.kts (root)
writeFile('build.gradle.kts', `
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}
`);

// 3. gradle.properties
writeFile('gradle.properties', `
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`);

// 4. gradle/libs.versions.toml
writeFile('gradle/libs.versions.toml', `
[versions]
agp = "8.3.1"
kotlin = "2.0.0"
coreKtx = "1.13.1"
lifecycleRuntimeKtx = "2.8.2"
activityCompose = "1.9.0"
composeBom = "2024.06.00"
navigationCompose = "2.7.7"
media3 = "1.3.1"
retrofit = "2.11.0"
okhttp = "4.12.0"
moshi = "1.15.1"
coil = "2.6.0"
room = "2.6.1"
datastore = "1.1.1"
coroutines = "1.8.1"
ksp = "2.0.0-1.0.21"
junit = "4.13.2"
mockk = "1.13.11"
junitVersion = "1.2.0"
espressoCore = "3.6.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-compose-material-icons = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }

# Media3 ExoPlayer
androidx-media3-exoplayer = { group = "androidx.media3", name = "media3-exoplayer", version.ref = "media3" }
androidx-media3-exoplayer-hls = { group = "androidx.media3", name = "media3-exoplayer-hls", version.ref = "media3" }
androidx-media3-exoplayer-dash = { group = "androidx.media3", name = "media3-exoplayer-dash", version.ref = "media3" }
androidx-media3-ui = { group = "androidx.media3", name = "media3-ui", version.ref = "media3" }
androidx-media3-session = { group = "androidx.media3", name = "media3-session", version.ref = "media3" }

# Networking
retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
retrofit-converter-moshi = { group = "com.squareup.retrofit2", name = "converter-moshi", version.ref = "retrofit" }
okhttp = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }
okhttp-logging = { group = "com.squareup.okhttp3", name = "logging-interceptor", version.ref = "okhttp" }
moshi = { group = "com.squareup.moshi", name = "moshi-kotlin", version.ref = "moshi" }

# Image Loading
coil-compose = { group = "io.coil-kt", name = "coil-compose", version.ref = "coil" }

# Local DB & Storage
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }

# Coroutines
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }
kotlinx-coroutines-test = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-test", version.ref = "coroutines" }

# Testing
junit = { group = "junit", name = "junit", version.ref = "junit" }
mockk = { group = "io.mockk", name = "mockk", version.ref = "mockk" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
`);

// 5. app/build.gradle.kts
writeFile('app/build.gradle.kts', `
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.anitube.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.anitube.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    
    // Compose
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons)
    implementation(libs.androidx.navigation.compose)

    // Media3 ExoPlayer
    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.androidx.media3.exoplayer.hls)
    implementation(libs.androidx.media3.exoplayer.dash)
    implementation(libs.androidx.media3.ui)
    implementation(libs.androidx.media3.session)

    // Networking & Serialization
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.moshi)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.moshi)

    // Image loading
    implementation(libs.coil.compose)

    // Room DB & DataStore
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)
    implementation(libs.androidx.datastore.preferences)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)

    // Unit Testing
    testImplementation(libs.junit)
    testImplementation(libs.mockk)
    testImplementation(libs.kotlinx.coroutines.test)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    debugImplementation(libs.androidx.compose.ui.tooling)
}
`);

// 6. AndroidManifest.xml
writeFile('app/src/main/AndroidManifest.xml', `
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:name=".AnitubeApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@drawable/ic_launcher_foreground"
        android:label="@string/app_name"
        android:roundIcon="@drawable/ic_launcher_foreground"
        android:supportsRtl="true"
        android:theme="@style/Theme.Anitube"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|smallestScreenSize|screenLayout|keyboardHidden"
            android:supportsPictureInPicture="true"
            android:theme="@style/Theme.Anitube">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep linking for AniList Anime ID -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="anitube" android:host="anime" />
            </intent-filter>
        </activity>

        <!-- Media3 Background Playback Service -->
        <service
            android:name=".player.Media3PlayerService"
            android:exported="false"
            android:foregroundServiceType="mediaPlayback">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaSessionService" />
            </intent-filter>
        </service>
    </application>

</manifest>
`);

// 7. XML Resources
writeFile('app/src/main/res/values/strings.xml', `
<resources>
    <string name="app_name">Anitube</string>
    <string name="nav_home">Home</string>
    <string name="nav_discover">Discover</string>
    <string name="nav_search">Search</string>
    <string name="nav_watchlist">Watchlist</string>
    <string name="nav_profile">Profile</string>
    <string name="play_now">Watch Now</string>
    <string name="episodes">Episodes</string>
    <string name="sub_dub_selector">Audio Track</string>
    <string name="retry">Retry</string>
</resources>
`);

writeFile('app/src/main/res/values/colors.xml', `
<resources>
    <color name="anitube_primary">#E50914</color>
    <color name="anitube_primary_variant">#B80710</color>
    <color name="anitube_background">#08080A</color>
    <color name="anitube_surface">#121318</color>
    <color name="anitube_surface_variant">#1C1E26</color>
    <color name="anitube_text_primary">#FFFFFF</color>
    <color name="anitube_text_secondary">#9E9EA7</color>
</resources>
`);

writeFile('app/src/main/res/values/themes.xml', `
<resources>
    <style name="Theme.Anitube" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">@color/anitube_background</item>
        <item name="android:navigationBarColor">@color/anitube_background</item>
        <item name="android:windowBackground">@color/anitube_background</item>
    </style>
</resources>
`);

writeFile('app/src/main/res/xml/data_extraction_rules.xml', `
<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="database" path="."/>
        <include domain="sharedpref" path="."/>
    </cloud-backup>
</data-extraction-rules>
`);

writeFile('app/src/main/res/xml/backup_rules.xml', `
<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <include domain="database" path="."/>
    <include domain="sharedpref" path="."/>
</full-backup-content>
`);

// Launcher Icon Vector
writeFile('app/src/main/res/drawable/ic_launcher_foreground.xml', `
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M54,20 L22,78 L38,78 L46,62 L62,62 L70,78 L86,78 Z M54,42 L59,52 L49,52 Z"/>
    <path
        android:fillColor="#E50914"
        android:pathData="M51,46 L61,54 L51,62 Z"/>
</vector>
`);

// 8. Kotlin Domain Models
writeFile('app/src/main/java/com/anitube/app/domain/model/Anime.kt', `
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
`);

// 9. Data Models (Moshi / Network)
writeFile('app/src/main/java/com/anitube/app/data/model/NetworkModels.kt', `
package com.anitube.app.data.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class AniListResponse(
    @Json(name = "data") val data: AniListPageData?
)

@JsonClass(generateAdapter = true)
data class AniListPageData(
    @Json(name = "Page") val page: AniListMediaPage?,
    @Json(name = "Media") val singleMedia: AniListMediaDto?
)

@JsonClass(generateAdapter = true)
data class AniListMediaPage(
    @Json(name = "media") val media: List<AniListMediaDto>?
)

@JsonClass(generateAdapter = true)
data class AniListMediaDto(
    @Json(name = "id") val id: Int,
    @Json(name = "title") val title: AniListTitleDto?,
    @Json(name = "coverImage") val coverImage: AniListCoverImageDto?,
    @Json(name = "bannerImage") val bannerImage: String?,
    @Json(name = "description") val description: String?,
    @Json(name = "genres") val genres: List<String>?,
    @Json(name = "averageScore") val averageScore: Int?,
    @Json(name = "episodes") val episodes: Int?,
    @Json(name = "format") val format: String?,
    @Json(name = "seasonYear") val seasonYear: Int?,
    @Json(name = "status") val status: String?
)

@JsonClass(generateAdapter = true)
data class AniListTitleDto(
    @Json(name = "romaji") val romaji: String?,
    @Json(name = "english") val english: String?,
    @Json(name = "native") val nativeTitle: String?
)

@JsonClass(generateAdapter = true)
data class AniListCoverImageDto(
    @Json(name = "extraLarge") val extraLarge: String?,
    @Json(name = "large") val large: String?
)

// Anivexa Models
@JsonClass(generateAdapter = true)
data class AnivexaWatchResponse(
    @Json(name = "anime") val anime: String?,
    @Json(name = "slug") val slug: String?,
    @Json(name = "ep") val ep: Int?,
    @Json(name = "audio") val audio: String?,
    @Json(name = "server") val server: String?,
    @Json(name = "stream_url") val streamUrl: String?,
    @Json(name = "streams") val streams: List<AnivexaStreamItem>?,
    @Json(name = "subtitles") val subtitles: List<AnivexaSubtitleItem>?,
    @Json(name = "intro") val intro: AnivexaSkipInterval?,
    @Json(name = "outro") val outro: AnivexaSkipInterval?
)

@JsonClass(generateAdapter = true)
data class AnivexaStreamItem(
    @Json(name = "server") val server: String?,
    @Json(name = "audio") val audio: String?,
    @Json(name = "url") val url: String?,
    @Json(name = "type") val type: String?
)

@JsonClass(generateAdapter = true)
data class AnivexaSubtitleItem(
    @Json(name = "url") val url: String,
    @Json(name = "language") val language: String,
    @Json(name = "format") val format: String,
    @Json(name = "default") val default: Boolean? = false
)

@JsonClass(generateAdapter = true)
data class AnivexaSkipInterval(
    @Json(name = "start") val start: Int?,
    @Json(name = "end") val end: Int?,
    @Json(name = "title") val title: String?
)
`);

// 10. Local Room DB
writeFile('app/src/main/java/com/anitube/app/data/local/Entities.kt', `
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
`);

writeFile('app/src/main/java/com/anitube/app/data/local/Daos.kt', `
package com.anitube.app.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface WatchHistoryDao {
    @Query("SELECT * FROM watch_history ORDER BY lastWatchedTimestamp DESC")
    fun getAllHistoryFlow(): Flow<List<WatchHistoryEntity>>

    @Query("SELECT * FROM watch_history WHERE animeId = :animeId ORDER BY lastWatchedTimestamp DESC LIMIT 1")
    suspend fun getLatestForAnime(animeId: Int): WatchHistoryEntity?

    @Query("SELECT * FROM watch_history WHERE episodeId = :episodeId LIMIT 1")
    suspend fun getProgressForEpisode(episodeId: String): WatchHistoryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveProgress(entity: WatchHistoryEntity)

    @Query("DELETE FROM watch_history WHERE episodeId = :episodeId")
    suspend fun deleteEpisodeHistory(episodeId: String)

    @Query("DELETE FROM watch_history")
    suspend fun clearAllHistory()
}

@Dao
interface WatchlistDao {
    @Query("SELECT * FROM watchlist ORDER BY addedAtTimestamp DESC")
    fun getWatchlistFlow(): Flow<List<WatchlistEntity>>

    @Query("SELECT EXISTS(SELECT 1 FROM watchlist WHERE animeId = :animeId)")
    fun isInWatchlistFlow(animeId: Int): Flow<Boolean>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addToWatchlist(entity: WatchlistEntity)

    @Query("DELETE FROM watchlist WHERE animeId = :animeId")
    suspend fun removeFromWatchlist(animeId: Int)
}
`);

writeFile('app/src/main/java/com/anitube/app/data/local/AnitubeDatabase.kt', `
package com.anitube.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [WatchHistoryEntity::class, WatchlistEntity::class], version = 1, exportSchema = false)
abstract class AnitubeDatabase : RoomDatabase() {
    abstract fun watchHistoryDao(): WatchHistoryDao
    abstract fun watchlistDao(): WatchlistDao

    companion object {
        @Volatile
        private var INSTANCE: AnitubeDatabase? = null

        fun getDatabase(context: Context): AnitubeDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AnitubeDatabase::class.java,
                    "anitube_database.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`);

// 11. Core Network
writeFile('app/src/main/java/com/anitube/app/core/network/AnivexaApiService.kt', `
package com.anitube.app.core.network

import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface AnivexaApiService {

    @GET("map/{anilistId}")
    suspend fun getMappings(
        @Path("anilistId") anilistId: Int
    ): Response<ResponseBody>

    @GET("episodes/{provider}/{anilistId}")
    suspend fun getEpisodesByProvider(
        @Path("provider") provider: String = "reanime",
        @Path("anilistId") anilistId: Int,
        @Query("map") map: Boolean = true
    ): Response<ResponseBody>

    @GET("watch/{provider}/{id}/{audio}/{epId}")
    suspend fun getStreamSource(
        @Path("provider") provider: String,
        @Path("id") id: String,
        @Path("audio") audio: String,
        @Path("epId") epId: String
    ): Response<ResponseBody>

    @GET("{watchPath}")
    suspend fun resolveDirectWatchPath(
        @Path(value = "watchPath", encoded = true) watchPath: String
    ): Response<ResponseBody>
}
`);

writeFile('app/src/main/java/com/anitube/app/core/network/AniListGraphQLClient.kt', `
package com.anitube.app.core.network

import com.anitube.app.domain.model.Anime
import com.anitube.app.domain.model.AnimeTitle
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class AniListGraphQLClient {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()
    private val endpoint = "https://graphql.anilist.co"

    suspend fun getTrendingAnime(perPage: Int = 20): Result<List<Anime>> = executePageQuery(
        query = """
            query (\$page: Int, \$perPage: Int) {
              Page(page: \$page, perPage: \$perPage) {
                media(type: ANIME, sort: TRENDING_DESC) {
                  id
                  title { english romaji native }
                  coverImage { large extraLarge }
                  bannerImage
                  genres
                  averageScore
                  episodes
                  format
                  seasonYear
                  description
                  status
                }
              }
            }
        """.trimIndent(),
        variables = mapOf("page" to 1, "perPage" to perPage)
    )

    suspend fun getPopularAnime(perPage: Int = 20): Result<List<Anime>> = executePageQuery(
        query = """
            query (\$page: Int, \$perPage: Int) {
              Page(page: \$page, perPage: \$perPage) {
                media(type: ANIME, sort: POPULARITY_DESC) {
                  id
                  title { english romaji native }
                  coverImage { large extraLarge }
                  bannerImage
                  genres
                  averageScore
                  episodes
                  format
                  seasonYear
                  description
                  status
                }
              }
            }
        """.trimIndent(),
        variables = mapOf("page" to 1, "perPage" to perPage)
    )

    suspend fun searchAnime(searchQuery: String, perPage: Int = 25): Result<List<Anime>> = executePageQuery(
        query = """
            query (\$search: String, \$perPage: Int) {
              Page(page: 1, perPage: \$perPage) {
                media(search: \$search, type: ANIME, sort: SEARCH_MATCH) {
                  id
                  title { english romaji native }
                  coverImage { large extraLarge }
                  bannerImage
                  genres
                  averageScore
                  episodes
                  format
                  seasonYear
                  description
                  status
                }
              }
            }
        """.trimIndent(),
        variables = mapOf("search" to searchQuery, "perPage" to perPage)
    )

    suspend fun getAnimeDetails(id: Int): Result<Anime> = withContext(Dispatchers.IO) {
        val query = """
            query (\$id: Int) {
              Media(id: \$id, type: ANIME) {
                id
                title { english romaji native }
                coverImage { large extraLarge }
                bannerImage
                genres
                averageScore
                episodes
                format
                seasonYear
                description
                status
              }
            }
        """.trimIndent()
        val payload = JSONObject().apply {
            put("query", query)
            put("variables", JSONObject(mapOf("id" to id)))
        }

        val request = Request.Builder()
            .url(endpoint)
            .post(payload.toString().toRequestBody(jsonMediaType))
            .build()

        try {
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("AniList HTTP error: \${response.code}"))
                }
                val bodyStr = response.body?.string() ?: return@withContext Result.failure(Exception("Empty response"))
                val json = JSONObject(bodyStr)
                val mediaObj = json.getJSONObject("data").getJSONObject("Media")
                Result.success(parseMediaObject(mediaObj))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun executePageQuery(query: String, variables: Map<String, Any>): Result<List<Anime>> =
        withContext(Dispatchers.IO) {
            val payload = JSONObject().apply {
                put("query", query)
                put("variables", JSONObject(variables))
            }

            val request = Request.Builder()
                .url(endpoint)
                .post(payload.toString().toRequestBody(jsonMediaType))
                .build()

            try {
                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        return@withContext Result.failure(Exception("AniList HTTP error: \${response.code}"))
                    }
                    val bodyStr = response.body?.string() ?: return@withContext Result.failure(Exception("Empty body"))
                    val json = JSONObject(bodyStr)
                    val mediaArray = json.getJSONObject("data").getJSONObject("Page").getJSONArray("media")
                    val list = mutableListOf<Anime>()
                    for (i in 0 until mediaArray.length()) {
                        list.add(parseMediaObject(mediaArray.getJSONObject(i)))
                    }
                    Result.success(list)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    private fun parseMediaObject(obj: JSONObject): Anime {
        val titleObj = obj.optJSONObject("title")
        val coverObj = obj.optJSONObject("coverImage")
        val genresArray = obj.optJSONArray("genres")
        val genres = mutableListOf<String>()
        if (genresArray != null) {
            for (g in 0 until genresArray.length()) {
                genres.add(genresArray.getString(g))
            }
        }

        return Anime(
            id = obj.getInt("id"),
            title = AnimeTitle(
                romaji = titleObj?.optString("romaji"),
                english = titleObj?.optString("english"),
                nativeTitle = titleObj?.optString("native")
            ),
            coverImage = coverObj?.optString("extraLarge") ?: coverObj?.optString("large"),
            bannerImage = obj.optString("bannerImage").takeIf { it.isNotBlank() },
            description = obj.optString("description")?.replace(Regex("<[^>]*>"), "")?.trim(),
            genres = genres,
            averageScore = if (obj.has("averageScore") && !obj.isNull("averageScore")) obj.getInt("averageScore") else null,
            episodes = if (obj.has("episodes") && !obj.isNull("episodes")) obj.getInt("episodes") else null,
            format = obj.optString("format"),
            seasonYear = if (obj.has("seasonYear") && !obj.isNull("seasonYear")) obj.getInt("seasonYear") else null,
            status = obj.optString("status")
        )
    }
}
`);

// 12. Streaming Repository
writeFile('app/src/main/java/com/anitube/app/data/repository/StreamingRepository.kt', `
package com.anitube.app.data.repository

import com.anitube.app.core.network.AnivexaApiService
import com.anitube.app.domain.model.Episode
import com.anitube.app.domain.model.StreamSource
import com.anitube.app.domain.model.SubtitleTrack
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import org.json.JSONObject
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

class StreamingRepository(
    baseUrl: String = "https://anivexa-api-production-e783.up.railway.app/"
) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC })
        .build()

    private val api: AnivexaApiService = Retrofit.Builder()
        .baseUrl(baseUrl)
        .client(client)
        .build()
        .create(AnivexaApiService::class.java)

    suspend fun getEpisodesForAnime(anilistId: Int, audioPref: String = "sub"): Result<List<Episode>> =
        withContext(Dispatchers.IO) {
            try {
                // Try primary provider "reanime", fallback to direct episodes endpoint
                val response = api.getEpisodesByProvider(provider = "reanime", anilistId = anilistId)
                if (!response.isSuccessful) {
                    return@withContext Result.failure(Exception("Episodes request failed: \${response.code()}"))
                }
                val bodyStr = response.body()?.string() ?: return@withContext Result.failure(Exception("Empty episode list"))
                val root = JSONObject(bodyStr)
                
                val providerNode = root.optJSONObject("reanime") 
                    ?: root.optJSONObject("mkissa") 
                    ?: root.optJSONObject("episodes")
                
                val epParent = providerNode?.optJSONObject("episodes") ?: providerNode

                val targetList = epParent?.optJSONArray(audioPref) 
                    ?: epParent?.optJSONArray("sub") 
                    ?: epParent?.optJSONArray("dub")

                if (targetList == null || targetList.length() == 0) {
                    return@withContext Result.success(emptyList())
                }

                val list = mutableListOf<Episode>()
                for (i in 0 until targetList.length()) {
                    val epObj = targetList.getJSONObject(i)
                    list.add(
                        Episode(
                            id = epObj.getString("id"),
                            number = epObj.optInt("number", i + 1),
                            title = epObj.optString("title").takeIf { it.isNotBlank() } ?: "Episode \${i + 1}",
                            thumbnail = epObj.optString("image").takeIf { it.isNotBlank() },
                            audio = epObj.optString("audio", audioPref),
                            durationSeconds = epObj.optInt("duration").takeIf { it > 0 },
                            isFiller = epObj.optBoolean("filler", false),
                            description = epObj.optString("description")
                        )
                    )
                }
                Result.success(list)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun resolveStream(episode: Episode): Result<StreamSource> = withContext(Dispatchers.IO) {
        try {
            // Anivexa episode.id is in format "watch/reanime/16498/sub/reanime-1"
            val watchPath = episode.id.removePrefix("/")
            val response = api.resolveDirectWatchPath(watchPath)
            if (!response.isSuccessful) {
                return@withContext Result.failure(Exception("Source resolution failed: HTTP \${response.code()}"))
            }

            val body = response.body()?.string() ?: return@withContext Result.failure(Exception("Empty stream body"))
            val json = JSONObject(body)

            val streamUrl = json.optString("stream_url").takeIf { it.isNotBlank() }
                ?: json.optJSONArray("streams")?.optJSONObject(0)?.optString("url")
                ?: return@withContext Result.failure(Exception("No playable HLS stream found in server response"))

            val subtitlesList = mutableListOf<SubtitleTrack>()
            val subsArray = json.optJSONArray("subtitles")
            if (subsArray != null) {
                for (i in 0 until subsArray.length()) {
                    val sub = subsArray.getJSONObject(i)
                    subtitlesList.add(
                        SubtitleTrack(
                            url = sub.getString("url"),
                            language = sub.optString("language", "Unknown"),
                            format = sub.optString("format", "vtt"),
                            isDefault = sub.optBoolean("default", false)
                        )
                    )
                }
            }

            val introObj = json.optJSONObject("intro")
            val outroObj = json.optJSONObject("outro")

            Result.success(
                StreamSource(
                    animeTitle = json.optString("anime"),
                    episodeNumber = json.optInt("ep", episode.number),
                    audio = json.optString("audio", episode.audio),
                    streamUrl = streamUrl,
                    serverName = json.optString("server", "HD-1"),
                    subtitles = subtitlesList,
                    introStart = introObj?.optInt("start"),
                    introEnd = introObj?.optInt("end"),
                    outroStart = outroObj?.optInt("start"),
                    outroEnd = outroObj?.optInt("end")
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
`);

// 13. Player State and Shared Controller (Single ExoPlayer instance with Persistent Mini-Player)
writeFile('app/src/main/java/com/anitube/app/player/PlayerState.kt', `
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
`);

writeFile('app/src/main/java/com/anitube/app/player/AnitubePlayerController.kt', `
package com.anitube.app.player

import android.content.Context
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
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

    val exoPlayer: ExoPlayer by lazy {
        ExoPlayer.Builder(context)
            .setMediaSourceFactory(DefaultMediaSourceFactory(context))
            .build().apply {
                addListener(this@AnitubePlayerController)
            }
    }

    private val _uiState = MutableStateFlow(PlayerUiState())
    val uiState: StateFlow<PlayerUiState> = _uiState.asStateFlow()

    init {
        startProgressTracker()
    }

    fun playEpisode(anime: Anime, episode: Episode, allEpisodes: List<Episode> = emptyList()) {
        _uiState.update {
            it.copy(
                anime = anime,
                currentEpisode = episode,
                episodeList = allEpisodes,
                isBuffering = true,
                errorMessage = null,
                isMiniPlayerActive = false,
                isFullScreen = true
            )
        }

        scope.launch {
            // Check saved progress from Room
            val savedProgress = database.watchHistoryDao().getProgressForEpisode(episode.id)
            val startMs = savedProgress?.currentPositionMs ?: 0L

            val result = streamingRepo.resolveStream(episode)
            result.onSuccess { streamSource ->
                _uiState.update { it.copy(streamSource = streamSource, isBuffering = false) }

                val mediaItem = MediaItem.fromUri(streamSource.streamUrl)
                exoPlayer.setMediaItem(mediaItem)
                if (startMs > 0L) {
                    exoPlayer.seekTo(startMs)
                }
                exoPlayer.prepare()
                exoPlayer.play()
            }.onFailure { error ->
                _uiState.update {
                    it.copy(
                        isBuffering = false,
                        errorMessage = "Stream resolution error: \${error.localizedMessage}"
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

    fun minimizeToMiniPlayer() {
        _uiState.update { it.copy(isMiniPlayerActive = true, isFullScreen = false) }
    }

    fun expandFromMiniPlayer() {
        _uiState.update { it.copy(isMiniPlayerActive = false, isFullScreen = true) }
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
            playEpisode(anime, nextEp, list)
        }
    }

    fun playPreviousEpisode() {
        val current = _uiState.value.currentEpisode ?: return
        val list = _uiState.value.episodeList
        val prevEp = list.find { it.number == current.number - 1 }
        val anime = _uiState.value.anime ?: return
        if (prevEp != null) {
            playEpisode(anime, prevEp, list)
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
        if (!isPlaying) persistCurrentProgress()
    }

    override fun onPlaybackStateChanged(playbackState: Int) {
        when (playbackState) {
            Player.STATE_BUFFERING -> _uiState.update { it.copy(isBuffering = true) }
            Player.STATE_READY -> _uiState.update {
                it.copy(
                    isBuffering = false,
                    durationMs = exoPlayer.duration.coerceAtLeast(0L)
                )
            }
            Player.STATE_ENDED -> {
                _uiState.update { it.copy(isPlaying = false) }
                playNextEpisode()
            }
            Player.STATE_IDLE -> Unit
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
`);

// 14. Media3 Player Background Service
writeFile('app/src/main/java/com/anitube/app/player/Media3PlayerService.kt', `
package com.anitube.app.player

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import androidx.annotation.OptIn
import androidx.core.app.NotificationCompat
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.anitube.app.MainActivity

@OptIn(UnstableApi::class)
class Media3PlayerService : MediaSessionService() {

    private var mediaSession: MediaSession? = null

    override fun onCreate() {
        super.onCreate()
        val controller = AnitubePlayerController.getInstance(this)
        
        val activityIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            activityIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        mediaSession = MediaSession.Builder(this, controller.exoPlayer)
            .setSessionActivity(pendingIntent)
            .build()

        createNotificationChannel()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
            mediaSession = null
        }
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Anitube Playback",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Background audio and video playback for Anitube"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_ID = "anitube_playback_channel"
    }
}
`);

// 15. Compose Design System (Theme, Colors, Typography)
writeFile('app/src/main/java/com/anitube/app/core/designsystem/Color.kt', `
package com.anitube.app.core.designsystem

import androidx.compose.ui.graphics.Color

val AnitubeCrimson = Color(0xFFE50914)
val AnitubeCrimsonLight = Color(0xFFFF2E3A)
val AnitubeCrimsonDark = Color(0xFF9E040D)

val DarkBackground = Color(0xFF08080A)
val DarkSurface = Color(0xFF121318)
val DarkSurfaceVariant = Color(0xFF1B1D24)
val DarkBorder = Color(0xFF282A34)

val TextPrimary = Color(0xFFFFFFFF)
val TextSecondary = Color(0xFF9E9EA7)
val TextMuted = Color(0xFF6B6E7B)
val GoldStar = Color(0xFFFFB800)
`);

writeFile('app/src/main/java/com/anitube/app/core/designsystem/Theme.kt', `
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
`);

// 16. Navigation Routes
writeFile('app/src/main/java/com/anitube/app/ui/navigation/Screen.kt', `
package com.anitube.app.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Home : Screen("home", "Home")
    object Discover : Screen("discover", "Discover")
    object Search : Screen("search", "Search")
    object Watchlist : Screen("watchlist", "Watchlist")
    object Profile : Screen("profile", "Profile")
    object Details : Screen("details/{animeId}", "Details") {
        fun createRoute(animeId: Int) = "details/$animeId"
    }
    object Diagnostics : Screen("diagnostics", "Diagnostics")
}
`);

// 17. Persistent MiniPlayer Composable
writeFile('app/src/main/java/com/anitube/app/ui/components/MiniPlayer.kt', `
package com.anitube.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.anitube.app.core.designsystem.AnitubeCrimson
import com.anitube.app.core.designsystem.DarkSurfaceVariant
import com.anitube.app.player.PlayerUiState

@Composable
fun MiniPlayer(
    playerState: PlayerUiState,
    onExpand: () -> Unit,
    onTogglePlayPause: () -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    AnimatedVisibility(
        visible = playerState.isMiniPlayerActive && playerState.currentEpisode != null,
        enter = slideInVertically(initialOffsetY = { it }),
        exit = slideOutVertically(targetOffsetY = { it }),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 4.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(DarkSurfaceVariant)
                .clickable { onExpand() }
        ) {
            // Mini progress bar on top
            LinearProgressIndicator(
                progress = { playerState.progressFraction },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(2.dp),
                color = AnitubeCrimson,
                trackColor = DarkSurfaceVariant
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Thumbnail
                AsyncImage(
                    model = playerState.currentEpisode?.thumbnail ?: playerState.anime?.coverImage,
                    contentDescription = null,
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )

                Spacer(modifier = Modifier.width(10.dp))

                // Title info
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = playerState.anime?.displayTitle ?: "Playing",
                        color = MaterialTheme.colorScheme.onSurface,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "Ep \${playerState.currentEpisode?.number ?: 1}: \${playerState.currentEpisode?.title ?: ""}",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 11.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                // Play / Pause
                IconButton(onClick = onTogglePlayPause) {
                    Icon(
                        imageVector = if (playerState.isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = "Play/Pause",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }

                // Expand Fullscreen
                IconButton(onClick = onExpand) {
                    Icon(
                        imageVector = Icons.Default.Fullscreen,
                        contentDescription = "Expand",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }

                // Close
                IconButton(onClick = onClose) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
`);

// 18. Full Video Player Screen
writeFile('app/src/main/java/com/anitube/app/ui/player/PlayerScreen.kt', `
package com.anitube.app.ui.player

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.util.UnstableApi
import androidx.media3.ui.PlayerView
import com.anitube.app.core.designsystem.AnitubeCrimson
import com.anitube.app.player.AnitubePlayerController
import com.anitube.app.player.PlayerUiState

@OptIn(UnstableApi::class)
@Composable
fun PlayerScreen(
    controller: AnitubePlayerController,
    onMinimize: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state by controller.uiState.collectAsState()
    var controlsVisible by remember { mutableStateOf(true) }
    val context = LocalContext.current

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Real AndroidX Media3 ExoPlayer PlayerView
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    player = controller.exoPlayer
                    useController = false
                    layoutParams = FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                }
            },
            modifier = Modifier
                .fillMaxSize()
                .clickable { controlsVisible = !controlsVisible }
        )

        // Loading spinner
        if (state.isBuffering) {
            CircularProgressIndicator(
                modifier = Modifier.align(Alignment.Center),
                color = AnitubeCrimson
            )
        }

        // Overlay Controls
        AnimatedVisibility(
            visible = controlsVisible,
            enter = fadeIn(),
            exit = fadeOut(),
            modifier = Modifier.fillMaxSize()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.5f))
            ) {
                // Top Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onMinimize) {
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = "Minimize",
                            tint = Color.White
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = state.anime?.displayTitle ?: "Anitube",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                        Text(
                            text = "Episode \${state.currentEpisode?.number ?: 1}: \${state.currentEpisode?.title ?: ""}",
                            color = Color.White.copy(alpha = 0.7f),
                            fontSize = 12.sp
                        )
                    }

                    Text(
                        text = "\${state.playbackSpeed}x",
                        color = Color.White,
                        modifier = Modifier
                            .clickable {
                                val nextSpeed = when (state.playbackSpeed) {
                                    1.0f -> 1.25f
                                    1.25f -> 1.5f
                                    1.5f -> 2.0f
                                    else -> 1.0f
                                }
                                controller.setSpeed(nextSpeed)
                            }
                            .padding(8.dp)
                    )
                }

                // Center Play/Pause & Skip buttons
                Row(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalArrangement = Arrangement.spacedBy(28.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = { controller.playPreviousEpisode() }) {
                        Icon(
                            imageVector = Icons.Default.SkipPrevious,
                            contentDescription = "Previous Episode",
                            tint = Color.White,
                            modifier = Modifier.size(36.dp)
                        )
                    }

                    IconButton(
                        onClick = { controller.togglePlayPause() },
                        modifier = Modifier
                            .size(64.dp)
                            .background(AnitubeCrimson, shape = RoundedCornerShape(32.dp))
                    ) {
                        Icon(
                            imageVector = if (state.isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = "Play/Pause",
                            tint = Color.White,
                            modifier = Modifier.size(36.dp)
                        )
                    }

                    IconButton(onClick = { controller.playNextEpisode() }) {
                        Icon(
                            imageVector = Icons.Default.SkipNext,
                            contentDescription = "Next Episode",
                            tint = Color.White,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                }

                // Bottom Timeline & Controls
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.BottomCenter)
                        .navigationBarsPadding()
                        .padding(16.dp)
                ) {
                    Slider(
                        value = state.progressFraction,
                        onValueChange = { frac ->
                            controller.seekTo((frac * state.durationMs).toLong())
                        },
                        colors = SliderDefaults.colors(
                            thumbColor = AnitubeCrimson,
                            activeTrackColor = AnitubeCrimson,
                            inactiveTrackColor = Color.White.copy(alpha = 0.3f)
                        )
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = formatTime(state.currentPositionMs),
                            color = Color.White,
                            fontSize = 12.sp
                        )
                        Text(
                            text = formatTime(state.durationMs),
                            color = Color.White.copy(alpha = 0.7f),
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
    }
}

private fun formatTime(millis: Long): String {
    val totalSeconds = millis / 1000
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return String.format("%02d:%02d", minutes, seconds)
}
`);

// 19. Home Screen Composable
writeFile('app/src/main/java/com/anitube/app/ui/home/HomeScreen.kt', `
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

    val featured = trendingAnime.firstOrNull()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // Featured Hero Banner
        if (featured != null) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(420.dp)
                        .clickable { onAnimeClick(featured.id) }
                ) {
                    AsyncImage(
                        model = featured.bannerImage ?: featured.coverImage,
                        contentDescription = featured.displayTitle,
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
                        Text(
                            text = featured.displayTitle,
                            fontSize = 26.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            if (featured.averageScore != null) {
                                Icon(
                                    imageVector = Icons.Default.Star,
                                    contentDescription = null,
                                    tint = GoldStar,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "\${featured.averageScore}%",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                            }
                            Text(
                                text = featured.genres.take(3).joinToString(" • "),
                                color = Color.White.copy(alpha = 0.8f),
                                fontSize = 12.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Button(
                            onClick = { onAnimeClick(featured.id) },
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
`);

// 20. Main Activity
writeFile('app/src/main/java/com/anitube/app/MainActivity.kt', `
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
                                            NavigationItem(Screen.Search.route, "Search", Icons.Default.Search),
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
`);

// 21. Application class
writeFile('app/src/main/java/com/anitube/app/AnitubeApplication.kt', `
package com.anitube.app

import android.app.Application
import com.anitube.app.data.local.AnitubeDatabase

class AnitubeApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize local Room DB
        AnitubeDatabase.getDatabase(this)
    }
}
`);

// 22. Unit Tests
writeFile('app/src/test/java/com/anitube/app/AnivexaMappingTest.kt', `
package com.anitube.app

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class AnivexaMappingTest {

    @Test
    fun testEpisodeJsonParsing() {
        val jsonString = """
            {
              "id": "watch/reanime/16498/sub/reanime-1",
              "number": 1,
              "title": "To You, 2000 Years in the Future",
              "audio": "sub",
              "filler": false
            }
        """.trimIndent()

        val json = JSONObject(jsonString)
        assertEquals("watch/reanime/16498/sub/reanime-1", json.getString("id"))
        assertEquals(1, json.getInt("number"))
        assertEquals("To You, 2000 Years in the Future", json.getString("title"))
        assertEquals("sub", json.getString("audio"))
    }

    @Test
    fun testStreamResponseParsing() {
        val streamJson = """
            {
              "anime": "Attack on Titan",
              "stream_url": "https://example.com/master.m3u8",
              "server": "HD-1",
              "audio": "sub"
            }
        """.trimIndent()

        val json = JSONObject(streamJson)
        assertNotNull(json.getString("stream_url"))
        assertEquals("https://example.com/master.m3u8", json.getString("stream_url"))
    }
}
`);

writeFile('app/src/test/java/com/anitube/app/WatchHistoryPersistenceTest.kt', `
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
`);

// 23. README with Build Instructions
writeFile('README.md', `
# Anitube - Native Android Anime Streaming Application

Anitube is a complete, native Android anime streaming application built with **Kotlin**, **Jetpack Compose**, **Material 3**, **AndroidX Media3 ExoPlayer**, **Room**, and **DataStore**, integrating real metadata from **AniList GraphQL** and verified streaming from the **Anivexa API**.

## Key Architecture Highlights

- **UI Framework**: 100% Jetpack Compose with Material 3 and Netflix-inspired dark crimson theme.
- **Persistent Mini-Player**: Single shared \`ExoPlayer\` instance that transitions seamlessly between full-screen playback and a floating mini-player docked above bottom navigation, without restarting or flickering.
- **Media Engine**: AndroidX Media3 ExoPlayer with adaptive HLS playback (\`.m3u8\`), multi-server support, and background \`MediaSessionService\`.
- **Local Persistence**: Room SQLite database for watch history, resumption timestamps, and watchlist.
- **Data Providers**:
  - **AniList GraphQL**: High-fidelity metadata, banners, ratings, air dates, and search.
  - **Anivexa API**: Episode list mapping and verified HLS video streams.

## How to Build in Android Studio

1. **Prerequisites**:
   - Android Studio Hedgehog (2023.1.1) or Ladybug/Koala or later.
   - JDK 17 or higher configured in Android Studio (\`Settings -> Build, Execution, Deployment -> Build Tools -> Gradle -> Gradle JDK\`).
   - Android SDK 34.

2. **Open Project**:
   - Open Android Studio.
   - Select **Open** and choose the \`anitube-android\` directory.
   - Allow Gradle to sync dependencies.

3. **Run on Device or Emulator**:
   - Connect an Android device (Android 8.0 / API 26+) with USB Debugging enabled, or launch an Android Virtual Device (AVD).
   - Click the green **Run (Shift+F10)** button in Android Studio.

4. **Build APK**:
   - Go to **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.
   - The compiled debug APK will be located at:
     \`app/build/outputs/apk/debug/app-debug.apk\`

## Running Unit Tests

Run via Gradle wrapper:
\`\`\`bash
./gradlew test
\`\`\`
`);

// Create ZIP file using JSZip
console.log('Packaging anitube-android into ZIP archive...');
const zip = new JSZip();

function addDirToZip(dirPath, zipFolder) {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const full = path.join(dirPath, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      addDirToZip(full, zipFolder.folder(item));
    } else {
      zipFolder.file(item, fs.readFileSync(full));
    }
  }
}

addDirToZip(rootDir, zip.folder('anitube-android'));

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }).then((buf) => {
  fs.writeFileSync(path.resolve('public/anitube-android.zip'), buf);
  fs.writeFileSync(path.resolve('anitube-android.zip'), buf);
  console.log('Successfully created public/anitube-android.zip (' + (buf.length / 1024).toFixed(1) + ' KB)');
});
