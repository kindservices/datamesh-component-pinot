import './app.css'
import PinotGridApp from './PinotGridApp.svelte'

const newApp = (container) => new PinotGridApp({
  target: container,
})

export default newApp
