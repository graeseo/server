FROM eclipse-temurin:19-jdk AS build
WORKDIR /app
COPY gradlew gradlew.bat ./
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts ./
COPY src src
RUN ./gradlew build -x test --no-daemon

FROM eclipse-temurin:19-jre
WORKDIR /app
COPY --from=build /app/build/libs/graeseo-server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
