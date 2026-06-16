#! /usr/bin/env zsh

podman build --tag express-server-dev --target dev --layers -f ./Dockerfile ../app

