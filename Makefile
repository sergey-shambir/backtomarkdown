.PHONY: all clean build test test_e2e download tidy run image

all: tidy test build

clean:
	rm -f bin/backtomarkdown

build:
	cd src/backtomarkdown && \
    CGO_ENABLED=0 go build -ldflags="-s -w" -o ../../bin/backtomarkdown && \
	cd ../..

test:
	cd src/backtomarkdown && \
	go test ./... && \
	cd ../..

tidy:
	cd src/backtomarkdown && \
	go mod tidy && \
	go mod vendor && \
	cd ../..

# Цель не запустится без явного указания
download:
	cd src/backtomarkdown && \
	go mod download && \
	cd ../..

# Цель не запустится без явного указания
e2e:
	cd tests/e2e && \
	npm run test && \
	cd ../..

# Цель не запустится без явного указания
run:
	cd src/backtomarkdown && \
	go run . && \
	cd ../..

# Цель не запустится без явного указания
image:
	docker build -t docker.local/backtomarkdown .
