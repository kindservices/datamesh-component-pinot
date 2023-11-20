#!/usr/bin/env bash

thisDir=$(cd `dirname $0` && pwd)

pushd "$thisDir/kafka"
echo "============== uninstalling kafka =============="
make uninstallArgo
popd


pushd "$thisDir/pinotdb"
echo "============== uninstalling pinot =============="
make uninstallArgo
popd

pushd "$thisDir/kafka-test-widget"
echo "============== uninstalling kafka-test-widget =============="
make uninstallArgo
popd


pushd "$thisDir/web"
echo "============== uninstalling web =============="
make uninstallArgo
popd