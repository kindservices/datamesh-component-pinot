#!/usr/bin/env bash

APP=${APP:-pinot-kafka}
BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}

installArgo() {
    # TODO - cange the namespace from 'default' to data-mesh
    argocd app create $APP \
    --repo https://github.com/kindservices/datamesh-component-pinot.git \
    --path kafka/k8s \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace default \
    --sync-policy automated \
    --auto-prune \
    --self-heal \
    --revision $BRANCH
}

uninstallArgo() {
    argocd app delete $APP --cascade
}