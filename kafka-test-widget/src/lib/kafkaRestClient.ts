import {kafkaHost, kafkaK8SHost} from './settings'

const KafkaHeaders = { 'Content-Type': 'application/vnd.kafka.json.v2+json' }

export const publishToKafka = async (topic, key, record) => {
    // this is a bit sloppy / wasteful, but it's an ugly way to 
    // try to publish kafka messages EITHER via a kafka-proxy directly OR
    // vai the dashboard proxy  
    const promise1 = publishViaProxy(topic, key, record)
    const promise2 = publishToKafkaDirectly(topic, key, record)
    return Promise.race([promise1, promise2])
}

const kafkaMsg = (key, record) => {
    return { records: [ { key: key, value: record }  ] }
}


// this function publishes directly to a Kafka REST proxy
export const publishViaProxy = async (topic, key, record) => {
    const proxyRequestBody = {
        proxy: `${kafkaK8SHost}/topics/${topic}`,
        method: "POST",
        headers: KafkaHeaders,
        body: kafkaMsg(key, record)
    }
    return fetch(`/api/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxyRequestBody)
      }).then((result) => {
        console.log(`POST to ${kafkaK8SHost}/topics/${topic} via /api/proxy ${result.ok ? "succeeded" : "failed"}:`, result);
        return result
      })
}


// this function publishes directly to a Kafka REST proxy
export const publishToKafkaDirectly = async (topic, key, record) => {
    return fetch(`${kafkaHost}/topics/${topic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.kafka.json.v2+json',
        },
        body: JSON.stringify({
          records: [
            { key: key, value: record } 
          ],
        }),
      }).then((result) => {
        console.log(`POST to ${kafkaHost}/topics/${topic} ${result.ok ? "succeeded" : "failed"}:`, result);
        return result
      })
}