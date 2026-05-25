package com.graeseo.server

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class GraeseoServerApplication

fun main(args: Array<String>) {
    runApplication<GraeseoServerApplication>(*args)
}
