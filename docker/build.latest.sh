#!/bin/bash

unset KUBECONFIG

cd .. && docker build -f docker/Dockerfile.latest \
             -t akshaycoder48/onyxagent .

docker tag akshaycoder48/onyxagent akshaycoder48/onyxagent:$(date +%y%m%d)