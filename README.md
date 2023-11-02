# About
This project was created to just kick the tyres of Apache Pinot, and to present a few  widgets in our ["data mesh"](https://kindservices.github.io/idea-labs/data-mesh/about.html) dashboard.

## Tracking Pixel

It simulates a simple "tracking pixel" used for identifying traffic to a website, and then related business queries reporting on that traffic by "the business" (e.g. website owners):


For the analytics portion of this demo, we'll want to emulate a "tracking pixel" emplanted on websites:

```mermaid
sequenceDiagram
    User->>Browser: goto website 
    Browser->>Web Server: GET /tracking/img.png?foo=bar
    Web Server-->>Kafka: Publish Hit {timestamp: ..., queryParams: {foo : bar}, headers: { ... }}
    Web Server->>Browser:200 OK
    Kafka-->>Pinot: Upsert ...

    Browser->>Web Server: POST /tracking/tick.png?foo=bar
    Web Server-->>Kafka: Publish Heartbeat {timestamp: ..., queryParams: {foo : bar}, headers: { ... }}
    Web Server->>Browser:200 OK
```

That request for a small, single-byte 1x1 image is the tracking pixel. The act of making that request to the server is tracked and used to inform the website owner who is visiting the website, from where, and for how long.

In this project, rather than include our own REST endpoint for serving a tracking pixel, we've instead used the [Kafka Rest Proxy](https://docs.confluent.io/platform/current/kafka-rest/api.html) with a little [test widget](./kafka-test-widget/README.md) to push data into Kafka.

The reason being that this is just for demo purposes, and a test/demo widget is always nice to have as well. (People can just use their imaginations for now that we can do the same thing by parsing a web request for a 1x1 tracking pixel)

# Building Locally

These components all run on Kubernetes, which we assume you have installed (see ['local-kubernetes'](https://github.com/kindservices/local-kubernetes) to get started with that.)


## Setting up Kafka / Pinot

With our Kafka and PinotDB running, we need to:
 * create a Kafka topic and
 * create a Pinot schema and table


### Creating the Kafka topic
Eventually we'll need this as Infrastructure as Code - perhaps with a K8S Job as part of our Argo deployment or (perhaps better) as an init container for our web test component.

For now, we'll create the topic manually. With Kafka deployed, select your kafka broker:

![K9S Kafka Broker](./docs/k9s-kafka-broker.png)

Then hit 's' to open a shell. With the shell open, run the following command:
```bash
kafka-topics --create --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic user-tracking-data
```
Which should display 'Created topic user-tracking-data':

![Create Kafka Topic](./docs/create-kafka-topic.png)

Success! We can type `exit` to get out of the shell.


**NOTE:**
It's also super-helpful to open a shell into a broker for debugging as well. 
You can see what messages are coming through the topic using the [kafka-console-consumer](https://kafka.apache.org/quickstart) tool:
```bash
kafka-console-consumer --bootstrap-server localhost:9092 --from-beginning --property print.key=true --topic user-tracking-data
```

### Pushing Test Data Into Kafka

Out kafka deployment also spun up the kafka rest proxy, which our [kafka-test-widget](./kafka-test-widget/README.md) will use to push test data into our new topic.

If we open K9S again, we can choose the kafka-rest-proxy component and use 'shift+f' to [port-forward](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/) the service to our localhost:8082:

![Port Forward](./docs/kafka-rest-port-forward.png)

Now we can run our really ugly [kafka-test-widget](./kafka-test-widget/README.md) locally:

```bash 
cd kafka-test-widget && make dev
```

![Publish Data](./docs/kafka-test-publish.png)

Success!

### Creating the table in Pinot

With out topic in hand and pinot running, we can also port-forward to a pinot controller at port 9000:

![Port forward pinot](./docs/port-forward-pinot.png)

You can see the controller REST API's Swagger file at [localhost:9000/help#/Table/alterTableStateOrListTableConfig](http://localhost:9000/help#/Table/alterTableStateOrListTableConfig)

```bash
curl -F schemaName=@data/schema.json  localhost:9000/schemas

curl -i -X POST -H 'Content-Type: application/json' -d @data/table.json localhost:9000/tables
```

![Added table](./docs/added-table.png)

And then, using our kafka test widget tool, we can see data going into pinot!

![Data Pinot](./docs/pinot-data.png)

... just too bad about all the nulls ;-)