package com.graeseo.server.api

import com.graeseo.server.service.FeedNotFoundException
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(FeedNotFoundException::class)
    fun handleFeedNotFound(ex: FeedNotFoundException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(503).body(mapOf("error" to (ex.message ?: "피드 데이터 없음")))
}
