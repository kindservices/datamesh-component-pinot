#!/usr/bin/env bash
APP=${APP:-pinot-db}
BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}

# NOTE: this currently doesn't work
installHelm() {
    echo "THIS LOCAL INSTALL IS CURRENTLY FAILING"
    echo "USE installArgo INSTEAD"
    pushd k8s
    helm package .
    helm install data-mesh-pinot-0.0.1 ./data-mesh-pinot-0.0.1.tgz
    popd
}

uninstallArgo() {
    argocd app delete $APP --cascade
}

installArgo() {
    # TODO - cange the namespace from 'default' to data-mesh
    argocd app create $APP \
    --repo https://github.com/kindservices/datamesh-component-pinot.git \
    --path pinotdb/k8s \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace data-mesh \
    --sync-policy automated \
    --auto-prune \
    --self-heal \
    --revision $BRANCH
}