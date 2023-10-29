#!/usr/bin/env bash
export TAG=${TAG:-local}
export IMG=${IMG:-kindservices/datamesh-component-pinot-web:$TAG}
export PORT=${PORT:-3000}


build() {
    echo "Building $IMG..."
    docker build --tag $IMG .
    echo "Built $IMG. To run:"
    echo ""
    echo "docker run -it -p $PORT:80 $IMG"
    echo ""
    echo "And open http://localhost:$PORT/bundle.js or http://localhost:$PORT/bundle.css"
}

dev() {
    yarn
    yarn dev
}

clean() {
    yarn cache clean
}

run() {
    echo "docker run -it --rm -p $PORT:80 -d $IMG"
    id=`docker run -it --rm -p $PORT:80 -d $IMG`
    cat > kill.sh <<EOL
docker kill $id
# clean up after ourselves
rm kill.sh
EOL
    chmod +x kill.sh

    echo "Running on port $PORT --- stop server using ./kill.sh"
}

installArgo() {
    APP=${APP:-pinot-web}
    BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}

    echo "creating $APP"
    
    kubectl create namespace data-mesh 2> /dev/null

    # beast mode :-)
    argocd app create $APP \
    --repo https://github.com/kindservices/datamesh-component-pinot.git \
    --path web/k8s \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace data-mesh \
    --sync-policy automated \
    --auto-prune \
    --self-heal \
    --revision $BRANCH

}