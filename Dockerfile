# syntax=docker/dockerfile:1.7-labs

# ===== Этап 1. Сборка Go =====
FROM golang:1.24.3-bookworm AS builder

WORKDIR /app

ENV GO111MODULE=on

# Загружаем зависимости до копирования остального кода,
#  чтобы закешировать этот долгий шаг.
COPY --parents Makefile src/backtomarkdown/go.mod src/backtomarkdown/go.sum .
RUN --mount=type=cache,target=/go/pkg/mod \
    make download

# Собираем статический бинарник, оптимизированный на минимальный размер
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    make build

# ===== Этап 2. Сборка runtime образа =====
FROM debian:bookworm-slim

# Обеспечиваем валидацию TLS сертификатов
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Добавляем непривилегированного unix-пользователя для безопасности
RUN groupadd --system --gid 1000 appgroup && \
    useradd --system --uid 1000 --gid appgroup --shell /bin/false appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /app/bin/backtomarkdown /app/

RUN mkdir -p /app/scorm_packages && \
    chown appuser:appgroup /app/scorm_packages

USER appuser

EXPOSE 8080

CMD ["./backtomarkdown"]