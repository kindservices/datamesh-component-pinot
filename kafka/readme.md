# Installing Kafka on K8S

We followed [this excellent write-up from datumo](https://www.datumo.io/blog/setting-up-kafka-on-kubernetes).


## Trying locally
With kubectl already running, you can just cd in to the kafka/k8s directory and run:

```
kubectl apply ./kafka.yaml
```

And then create a topic as per the datumo docs. Rather than `kubectl exec`, we can just use k9s to select the broker and choose `s` to open a shell.


![Get Pods](get-pods.png)
