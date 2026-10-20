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
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val api: AnivexaApiService = Retrofit.Builder()
        .baseUrl(baseUrl)
        .client(client)
        .build()
        .create(AnivexaApiService::class.java)

    private val providerCandidates = listOf("anizone", "kaa", "reanime", "senshi")

    suspend fun getEpisodesForAnime(anilistId: Int, audioPref: String = "sub"): Result<List<Episode>> =
        withContext(Dispatchers.IO) {
            for (provider in providerCandidates) {
                try {
                    val response = api.getEpisodesByProvider(provider = provider, anilistId = anilistId)
                    if (!response.isSuccessful) continue
                    val bodyStr = response.body()?.string() ?: continue
                    val root = JSONObject(bodyStr)
                    
                    val providerNode = root.optJSONObject(provider) 
                        ?: root.optJSONObject("episodes")
                        ?: root
                    
                    val epParent = providerNode.optJSONObject("episodes") ?: providerNode

                    val targetList = epParent.optJSONArray(audioPref) 
                        ?: epParent.optJSONArray("sub") 
                        ?: epParent.optJSONArray("dub")

                    if (targetList != null && targetList.length() > 0) {
                        val list = mutableListOf<Episode>()
                        for (i in 0 until targetList.length()) {
                            val epObj = targetList.getJSONObject(i)
                            list.add(
                                Episode(
                                    id = epObj.getString("id"),
                                    number = epObj.optInt("number", i + 1),
                                    title = epObj.optString("title").takeIf { it.isNotBlank() } ?: "Episode ${i + 1}",
                                    thumbnail = epObj.optString("image").takeIf { it.isNotBlank() },
                                    audio = epObj.optString("audio", audioPref),
                                    durationSeconds = epObj.optInt("duration").takeIf { it > 0 },
                                    isFiller = epObj.optBoolean("filler", false),
                                    description = epObj.optString("description")
                                )
                            )
                        }
                        return@withContext Result.success(list)
                    }
                } catch (_: Exception) {
                    // Try next provider silently
                }
            }
            Result.success(emptyList())
        }

    suspend fun resolveStream(episode: Episode): Result<StreamSource> = withContext(Dispatchers.IO) {
        try {
            val watchPath = episode.id.removePrefix("/")
            val response = api.resolveDirectWatchPath(watchPath)
            if (!response.isSuccessful) {
                return@withContext Result.failure(Exception("Streaming source unavailable (${response.code()})"))
            }

            val body = response.body()?.string() ?: return@withContext Result.failure(Exception("Empty stream body"))
            val json = JSONObject(body)

            var streamUrl = json.optString("stream_url").takeIf { it.isNotBlank() }
            val streamsArray = json.optJSONArray("streams")
            if (streamsArray != null && streamsArray.length() > 0) {
                for (i in 0 until streamsArray.length()) {
                    val s = streamsArray.getJSONObject(i)
                    val u = s.optString("url")
                    if (u.isNotBlank() && (u.endsWith(".m3u8") || s.optString("type") == "hls")) {
                        streamUrl = u
                        break
                    }
                }
            }

            if (streamUrl.isNullOrBlank()) {
                return@withContext Result.failure(Exception("No playable HLS stream found"))
            }

            val subtitlesList = mutableListOf<SubtitleTrack>()
            val subsArray = json.optJSONArray("subtitles")
            if (subsArray != null) {
                for (i in 0 until subsArray.length()) {
                    val sub = subsArray.getJSONObject(i)
                    subtitlesList.add(
                        SubtitleTrack(
                            url = sub.getString("url"),
                            language = sub.optString("language", sub.optString("label", "Subtitles")),
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
                    serverName = "HD-1",
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
