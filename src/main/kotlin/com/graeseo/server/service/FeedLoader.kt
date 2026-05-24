package com.graeseo.server.service

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.graeseo.server.domain.FeedData
import com.graeseo.server.domain.StockEvent
import org.springframework.stereotype.Component
import java.io.File
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.Locale

@Component
class FeedLoader(private val outputDir: File = File("output")) : FeedLoaderPort {

    private val mapper = jacksonObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

    override fun loadLatest(): FeedData {
        val file = outputDir.listFiles { f -> f.extension == "json" }
            ?.maxByOrNull { it.nameWithoutExtension }
            ?: throw NoSuchElementException("생성된 피드 파일이 없습니다.")

        val raw = mapper.readValue<FeedData>(file)
        return raw.copy(events = raw.events.map { it.withDay() })
    }

    private fun StockEvent.withDay(): StockEvent {
        if (day.isNotBlank()) return this
        return try {
            val (month, dayOfMonth) = date.split("/").map { it.trim().toInt() }
            val localDate = LocalDate.of(LocalDate.now().year, month, dayOfMonth)
            copy(day = localDate.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.KOREAN).first().toString())
        } catch (_: Exception) {
            this
        }
    }
}
