# Kafka Operations


## Creating a topic

With kafka running, you can use k9s to select a kafka broker and choose `s` to open a shell, followed by:

```
kafka-topics --create --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic user-tracking-data

kafka-console-consumer --bootstrap-server localhost:9092 --topic user-tracking-data
```

And now publish some messages:
```
kubectl run --rm -it debug-pod --image=python:3.9 -- bash
```

Then install confluent-kafka and fire up python:

```bash
pip install confluent-kafka --quiet
python
```

```bash
from confluent_kafka import Producer
import socket

conf = {"bootstrap.servers": "kafka-service:9092", "client.id": socket.gethostname()}

producer = Producer(conf)
producer.produce("user-tracking-data", key="message", value="message_from_python_producer")
```

