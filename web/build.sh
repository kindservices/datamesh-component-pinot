#!/usr/bin/env bash
export TAG=${TAG:-local}
export IMG=${IMG:-kindservices/datamesh-component-pinot-web:$TAG}
export PORT=${PORT:-3000}
export APP=${APP:-pinot-web}
export BRANCH=${BRANCH:-`git rev-parse --abbrev-ref HEAD`}

build() {
    echo "Building $IMG..."
    docker build --tag $IMG .
    echo "Built $IMG. To run:"
    echo ""
    echo "  docker run -it --rm --name app -p $PORT:80 $IMG"
    echo ""
    echo "And open http://localhost:$PORT/bundle.js or http://localhost:$PORT/bundle.css"
}

dev() {
    which pnpm || (echo "pnpm not installed. Try 'brew install pnpm'?" && exit 1)
    pnpm install
    pnpm dev
}

clean() {
    pnpm store prune
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

uninstallArgo() {
  argocd app delete $APP --cascade
}

installArgo() {
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