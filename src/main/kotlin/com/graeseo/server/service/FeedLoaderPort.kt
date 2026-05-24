package com.graeseo.server.service

import com.graeseo.server.domain.FeedData

interface FeedLoaderPort {
    fun loadLatest(): FeedData
}
