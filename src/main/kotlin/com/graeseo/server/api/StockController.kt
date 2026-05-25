package com.graeseo.server.api

import com.graeseo.server.domain.Stock
import com.graeseo.server.domain.StockNarrative
import com.graeseo.server.service.StockService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/stocks")
class StockController(private val stockService: StockService) {

    @GetMapping
    fun getAll(): List<Stock> = stockService.getAll()

    @GetMapping("/{key}")
    fun getByKey(@PathVariable key: String): ResponseEntity<Stock> =
        stockService.getByKey(key)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()

    @GetMapping("/narratives")
    fun getNarratives(): List<StockNarrative> = stockService.getNarratives()
}
