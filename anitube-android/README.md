# Anitube - Native Android Anime Streaming Application

Anitube is a complete, native Android anime streaming application built with **Kotlin**, **Jetpack Compose**, **Material 3**, **AndroidX Media3 ExoPlayer**, **Room**, and **DataStore**, integrating real metadata from **AniList GraphQL** and verified streaming from the **Anivexa API**.

## Key Architecture Highlights

- **UI Framework**: 100% Jetpack Compose with Material 3 and Netflix-inspired dark crimson theme.
- **Persistent Mini-Player**: Single shared `ExoPlayer` instance that transitions seamlessly between full-screen playback and a floating mini-player docked above bottom navigation, without restarting or flickering.
- **Media Engine**: AndroidX Media3 ExoPlayer with adaptive HLS playback (`.m3u8`), multi-server support, and background `MediaSessionService`.
- **Local Persistence**: Room SQLite database for watch history, resumption timestamps, and watchlist.
- **Data Providers**:
  - **AniList GraphQL**: High-fidelity metadata, banners, ratings, air dates, and search.
  - **Anivexa API**: Episode list mapping and verified HLS video streams.

## How to Build in Android Studio

1. **Prerequisites**:
   - Android Studio Hedgehog (2023.1.1) or Ladybug/Koala or later.
   - JDK 17 or higher configured in Android Studio (`Settings -> Build, Execution, Deployment -> Build Tools -> Gradle -> Gradle JDK`).
   - Android SDK 34.

2. **Open Project**:
   - Open Android Studio.
   - Select **Open** and choose the `anitube-android` directory.
   - Allow Gradle to sync dependencies.

3. **Run on Device or Emulator**:
   - Connect an Android device (Android 8.0 / API 26+) with USB Debugging enabled, or launch an Android Virtual Device (AVD).
   - Click the green **Run (Shift+F10)** button in Android Studio.

4. **Build APK**:
   - Go to **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.
   - The compiled debug APK will be located at:
     `app/build/outputs/apk/debug/app-debug.apk`

## Running Unit Tests

Run via Gradle wrapper:
```bash
./gradlew test
```
