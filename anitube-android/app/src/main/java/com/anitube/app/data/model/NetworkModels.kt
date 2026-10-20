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
