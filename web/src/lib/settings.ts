
export const pinotBFFHost = "http://pinot-component-bff-service.data-mesh:8081"

export const pinotBrokerHost = "http://pinot-db-broker.data-mesh:8099"

const dashboardHostLocalhost = "http://localhost:3000"
const dashboardHostK8S = "http://dashboard-web.data-mesh:3000"
export const dashboardHost = (window.location.hostname == "" || window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1") ? dashboardHostLocalhost : dashboardHostK8S