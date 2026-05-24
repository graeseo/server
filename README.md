# graeseo-server

> 그래서 — 이벤트·시나리오 데이터 API 서버

## 기술 스택

- Kotlin + Spring Boot 3
- Spring Data JPA
- JUnit 5 + Kotest (테스트)

## 브랜치 전략 (Git Flow)

```
main      ← 프로덕션 배포
develop   ← 통합 브랜치
feature/* ← 기능 개발
release/* ← 릴리즈 준비
hotfix/*  ← 긴급 수정
```

## 시작하기

```bash
./gradlew bootRun
```

## 테스트

```bash
./gradlew test
```
