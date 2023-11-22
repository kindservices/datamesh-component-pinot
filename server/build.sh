#!/usr/bin/env bash
export BUILD_NUMBER=${BUILD_NUMBER:-local}
export NAME="kindservices/datamesh-component-pinot-bff"
export IMG=${IMG:-$NAME:$BUILD_NUMBER}
export PORT=${PORT:-8081}
export APP=${APP:-pinot-bff}

echo "BUILD_NUMBER : $BUILD_NUMBER"
echo "        NAME : $NAME"

uninstallArgo() {
    argocd app delete $APP
}

# build the docker image
buildDocker() {
    docker build -t $IMG .
}

# build using docker -- no need to install SBT locally
buildInDocker() {
    docker buildx create --use
    docker buildx inspect
    docker buildx build -o type=docker --platform linux/amd64,linux/arm64 -f Dockerfile.inDocker -t $IMG -t $NAME:latest .
}

build() {
    scala-cli fmt . 
    scala-cli --power package App.scala -o app.jar --force --assembly
}

clean() {
    [[ -f app.jar ]] && rm app.jar || echo ""
}

run() {
    # NOTE - the broker, not the controller!
    PINOT_BROKER_HOSTPORT=http://localhost:8099 PORT=8085 scala-cli App.scala 
}


runInDocker() {
    echo "docker run -it --rm -p $PORT:$PORT -d $IMG"
    id=`docker run -it --rm -p $PORT:$PORT -d $IMG`
    cat > kill.sh <<EOL
docker kill $id
# clean up after ourselves
rm kill.sh
EOL
    chmod +x kill.sh

    echo "Running on port $PORT --- stop server using ./kill.sh"
}

# convenience method for installing this app in argo, assuming argocd is installed and logged in
installArgo() {
    BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}

    echo "creating $APP to point at $BRANCH"
    
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
