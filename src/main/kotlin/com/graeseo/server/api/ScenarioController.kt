package com.graeseo.server.api

import com.graeseo.server.domain.Scenario
import com.graeseo.server.service.ScenarioService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/scenarios")
class ScenarioController(private val scenarioService: ScenarioService) {

    @GetMapping
    fun get(
        @RequestParam eventId: String,
        @RequestParam(required = false) stock: String?,
    ): ResponseEntity<Any> =
        if (!stock.isNullOrBlank()) {
            scenarioService.getByEventAndStock(eventId, stock)
                ?.let { ResponseEntity.ok(it) }
                ?: ResponseEntity.notFound().build()
        } else {
            ResponseEntity.ok(scenarioService.getByEvent(eventId))
        }
}
