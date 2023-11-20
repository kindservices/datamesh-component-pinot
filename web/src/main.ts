import './app.css'
import PinotGridApp from './PinotGridApp.svelte'

const app = new PinotGridApp({
  target: document.getElementById('webcomponent-app'),
})

export default app
