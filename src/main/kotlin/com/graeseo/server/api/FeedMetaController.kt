package com.graeseo.server.api

import com.graeseo.server.service.FeedLoaderPort
import org.springframework.web.bind.annotation.*

data class FeedMeta(val generatedAt: String)

@RestController
@RequestMapping("/api/meta")
class FeedMetaController(private val feedLoader: FeedLoaderPort) {

    @GetMapping
    fun get(): FeedMeta = FeedMeta(feedLoader.loadLatest().generatedAt)
}
