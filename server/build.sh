#!/usr/bin/env bash
export TAG=${TAG:-local}
export IMG=${IMG:-kindservices/datamesh-component-pinot-bff:$TAG}
export PORT=${PORT:-8080}

# scala-cli --power package --docker App.scala --docker-from openjdk:11 --docker-image-repository service-registry

build() {
    #pwd  --platform "linux/amd64,linux/arm64"
    docker build --tag $IMG .
}

run() {
    id=`docker run -it --rm -p 8089:$PORT -d $IMG`
    cat > kill.sh <<EOL
docker kill $id
# clean up after ourselves
rm kill.sh
EOL
    chmod +x kill.sh

    echo "Running on port 8089 --- stop server using ./kill.sh"
}

installArgo() {
    APP=${APP:-pinot-bff}
    BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}
    
    kubectl create namespace data-mesh 2> /dev/null

    argocd app create $APP \
    --repo https://github.com/kindservices/datamesh-component-pinot.git \
    --path server/k8s \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace data-mesh \
    --sync-policy automated \
    --auto-prune \
    --self-heal \
    --revision $BRANCH
}