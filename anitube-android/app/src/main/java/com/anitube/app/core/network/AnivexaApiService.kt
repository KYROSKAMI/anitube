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
