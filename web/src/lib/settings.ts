
// Use the local if you're using port-forward
const pinotBFFHostLocal = "http://localhost:8082"
const pinotBFFHostK8s = "http://pinot-component-bff-service.data-mesh:8081"

// the window hostname is empty when served from file:// in the browser (e.g. when opening our ./test/local-test.html)
export const pinotBFFHost = (window.location.hostname == "" || window.location.hostname == "127.0.0.1") ? pinotBFFHostLocal : pinotBFFHostK8s;

export const pinotBrokerHost = "http://pinot-db-broker.data-mesh:8099"

const dashboardHostLocalhost = "http://localhost:3000"
const dashboardHostK8S = "http://dashboard-web.data-mesh:3000"
export const dashboardHost = (window.location.hostname == "" || window.location.hostname == "127.0.0.1") ? dashboardHostLocalhost : dashboardHostK8S