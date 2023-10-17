#!/usr/bin/env bash

thisDir=$(cd `dirname $0` && pwd)
serverDir="$thisDir/server"
webDir="$thisDir/web"

pushd "$serverDir"
echo "============== installing server in `pwd` =============="
make installArgo
popd

pushd "$webDir"
echo "============== installing web in `pwd` =============="
make installArgo
popd
