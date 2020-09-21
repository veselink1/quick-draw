# Quick, Draw!

[![Build Status](https://github.com/veselink1/quick-draw/workflows/build/badge.svg)](https://github.com/qiangxue/go-rest-api/actions?query=workflow%3Abuild)

> Project Template: https://github.com/qiangxue/go-rest-api

## Project Layout

The starter kit uses the following project layout:

```
.
├── cmd                  main applications of the project
│   └── server           the API server application
├── config               configuration files for different environments
├── internal             private application and library code
│   ├── room             game room-related features
│   ├── auth             authentication feature
│   ├── config           configuration library
│   ├── entity           entity definitions and domain logic
│   ├── errors           error types and handling
│   ├── healthcheck      healthcheck feature
│   └── test             helpers for testing purpose
├── migrations           database migrations
├── pkg                  public library code
│   ├── accesslog        access log middleware
│   ├── graceful         graceful shutdown of HTTP server
│   ├── log              structured and context-aware logger
│   └── pagination       paginated list
└── testdata             test data scripts
```

## Deployment

The application can be run as a docker container. You can use `make build-docker` to build the application
into a docker image. The docker container starts with the `cmd/server/entryscript.sh` script which reads
the `APP_ENV` environment variable to determine which configuration file to use. For example,
if `APP_ENV` is `qa`, the application will be started with the `config/qa.yml` configuration file.

You can also run `make build` to build an executable binary named `server`. Then start the API server using the following
command,

```shell
./server -config=./config/prod.yml
```

```
