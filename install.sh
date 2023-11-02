#!/usr/bin/env bash

thisDir=$(cd `dirname $0` && pwd)

pushd "$thisDir/kafka"
echo "============== installing kafka =============="
make installArgo
popd


pushd "$thisDir/pinotdb"
echo "============== installing pinot =============="
make installArgo
popd

pushd "$thisDir/kafka-test-widget"
echo "============== installing kafka-test-widget =============="
make installArgo
popd


pushd "$thisDir/web"
echo "============== installing web in `pwd` =============="
make installArgo
popd


echo "   +-------------------------------------------------------+"
echo "   | all installed! You'll need to create a kafka topic    |"
echo "   | and create the pinot schema/table. See the readme.md  |"
echo "   | for more - which just tells you to run the following  |"
echo "   | after port-forwarding kafka and pinot controller.     |"
echo "   +-------------------------------------------------------+"
echo
echo
echo "kafka-topics --create --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic user-tracking-data"
echo "curl -F schemaName=@data/schema.json  localhost:9000/schemas"
echo "curl -i -X POST -H 'Content-Type: application/json' -d @data/table.json localhost:9000/tables"
echo
echo