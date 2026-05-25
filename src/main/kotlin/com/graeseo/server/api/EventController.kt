package com.graeseo.server.api

import com.graeseo.server.domain.StockEvent
import com.graeseo.server.service.EventService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/events")
class EventController(private val eventService: EventService) {

    @GetMapping
    fun getByFilter(@RequestParam(defaultValue = "all") filter: String): List<StockEvent> =
        eventService.getByFilter(filter)

    @GetMapping("/{id}")
    fun getById(@PathVariable id: String): ResponseEntity<StockEvent> =
        eventService.getById(id)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()
}
