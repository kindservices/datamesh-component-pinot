# Pinot

We are using [Apache Pinot](https://docs.pinot.apache.org) as our OLAP database, which we set up to ingest data from Apache Kafka.

In a real-world example, we would be using avro with the Kafka Schema Registry. Here we're just using json.

You can see our [data model here](.data/readme.md)


## Spinning up Pinot

You can use `make installArgo` which will deploy pinot to your cluster:

![Argo Pinot](./docs/argoPinot.png)

# Appendex - the steps I followed

As per the docs:

```
helm repo add pinot https://raw.githubusercontent.com/apache/pinot/master/kubernetes/helm
kubectl create ns pinot-quickstart
helm install pinot pinot/pinot \
    -n pinot-quickstart \
    --set cluster.name=pinot \
    --set server.replicaCount=2
```


We reference the main helm chart as per [here](https://blog.devops.dev/stop-cloning-helm-charts-enough-b40fb5d67ac7)

```
helm create data-mesh-pinot
# added dependency on pinot chart
helm repo update
helm dependency update

# then
helm install data-mesh-pinot .
```

