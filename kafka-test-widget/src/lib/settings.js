export const kafkaLocalHost = "http://localhost:8082"
export const kafkaK8SHost = "http://kafka-service:8082"
const host = window.location.hostname;
const isLocalHost = host.indexOf("127.0.0.1") >= 0
export const kafkaHost = (isLocalHost) ? kafkaLocalHost : kafkaK8SHost
console.log("host is " + host + ", isLocalHost is " + isLocalHost + ", kafkaHost is " + kafkaHost);