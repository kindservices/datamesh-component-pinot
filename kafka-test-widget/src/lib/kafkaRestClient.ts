import {kafkaHost, kafkaK8SHost} from './settings'

const KafkaHeaders = { 'Content-Type': 'application/vnd.kafka.json.v2+json' }

function raceSuccessfulPromises<T>(promises: Promise<T>[]): Promise<T> {
  var failCount = 0

  return new Promise<T>((resolve, reject) => {
    promises.forEach((promise) => {
      promise.then(resolve).catch((e) => {
        if (failCount > 0) {
          reject(e)
        }
        failCount = failCount + 1
      })
    })
  })
}

export const publishToKafka = async (topic, key, record) => {
    // this is a bit sloppy / wasteful, but it's an ugly way to 
    // try to publish kafka messages EITHER via a kafka-proxy directly OR
    // vai the dashboard proxy  
    const promise1 = publishViaProxy(topic, key, record)
    const promise2 = publishToKafkaDirectly(topic, key, record)
    // return Promise.race([promise1, promise2])
    return raceSuccessfulPromises([promise1, promise2])
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
        console.log(`proxy POST to ${kafkaK8SHost}/topics/${topic} via /api/proxy ${result.ok ? "succeeded" : "failed"}:`, result)
        if (!result.ok) {
          console.log("throwing for proxy...")
          throw new Error(`POST to ${kafkaK8SHost}/topics/${topic} via /api/proxy failed w/ status ${result.status}`)
        }
        console.log(`proxy returning ${kafkaHost}/topics/${topic} w/ status ${result.status}`, result)
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
        console.log(`REST POST to ${kafkaHost}/topics/${topic} ${result.ok ? "succeeded" : "failed"}:`, result)
        if (!result.ok) {
          console.log("throwing for kafka rest directly...")
          throw new Error(`${kafkaHost}/topics/${topic} failed w/ status ${result.status}`)
        }
        console.log(`REST returning ${kafkaHost}/topics/${topic} w/ status ${result.status}`, result)
        return result
      })
}