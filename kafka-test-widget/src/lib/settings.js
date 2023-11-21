export const kafkaLocalHost = "http://localhost:8082"
export const kafkaK8SHost = "http://kafka-service:8082"
const host = window.location.hostname;
const isLocalHost = host.indexOf("127.0.0.1") >= 0

// we're being a bit clever here -- using a local port-forward
// when running on localhost (e.g. 127.0.0.1). 
export const kafkaHost = (isLocalHost) ? kafkaLocalHost : kafkaK8SHost

// our dashboard proxy, if we need to send messages to Kafka via our dashboard
export const proxyHost = (isLocalHost) ? "http://localhost:3000" : "http://dashboard-web.data-mesh:3000"

console.log("host is " + host + ", isLocalHost is " + isLocalHost + ", kafkaHost is " + kafkaHost);