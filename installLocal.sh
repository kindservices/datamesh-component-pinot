#!/usr/bin/env bash

echo "=============================================="
echo "====== Installing locally using kubectl ======"
echo "=============================================="

thisDir=$(cd `dirname $0` && pwd)


echo "============== installing kafka =============="
cd ./kafka && make installArgo


echo "============== installing pinot in `pwd` =============="
# This doesn't work :-(
# Guess we'll stick w/ Argo for now 💪
# cd ./pinotdb && make installHelm
cd ./pinotdb && make installArgo

