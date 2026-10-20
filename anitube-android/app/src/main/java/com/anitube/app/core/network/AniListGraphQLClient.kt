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
            query ($page: Int, $perPage: Int) {
              Page(page: $page, perPage: $perPage) {
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
            query ($page: Int, $perPage: Int) {
              Page(page: $page, perPage: $perPage) {
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
            query ($search: String, $perPage: Int) {
              Page(page: 1, perPage: $perPage) {
                media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
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
            query ($id: Int) {
              Media(id: $id, type: ANIME) {
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
                    return@withContext Result.failure(Exception("AniList HTTP error: ${response.code}"))
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
                        return@withContext Result.failure(Exception("AniList HTTP error: ${response.code}"))
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
