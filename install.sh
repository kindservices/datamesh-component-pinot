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


pushd "$thisDir/server"
echo "============== installing bff server =============="
make installArgo
popd

pushd "$thisDir/web"
echo "============== installing web =============="
make installArgo
popd


echo "   +-------------------------------------------------------+"
echo "   | all installed! You'll need to create a kafka topic    |"
echo "   | and create the pinot schema/table. See the readme.md  |"
echo "   | for more - which just tells you to run the following  |"
echo "   | after port-forwarding kafka and pinot controller.     |"
echo "   +-------------------------------------------------------+"
echo
echo "open a shell to a kafka broker to run:"
echo "  kafka-topics --create --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic user-tracking-data"
echo
echo "port-forward the pinot-db-controller to run:"
echo "  curl -F schemaName=@pinotdb/schema.json  localhost:9000/schemas"
echo "  curl -i -X POST -H 'Content-Type: application/json' -d @pinotdb/table.json localhost:9000/tables"
echo
echo "and open the query browser at localhost:9000"
echo
echo "port-forward kafka-rest (port 8082) to run the kafka test widget locally to insert test data"
echo ""
