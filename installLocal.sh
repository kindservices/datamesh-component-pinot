#!/usr/bin/env bash

echo "=============================================="
echo "====== Installing locally using kubectl ======"
echo "=============================================="

thisDir=$(cd `dirname $0` && pwd)


echo "============== installing kafka =============="
kubectl apply -f $thisDir/kafka/k8s


echo "============== installing pinot in `pwd` =============="
kubectl apply -f $thisDir/pinotdb/k8s