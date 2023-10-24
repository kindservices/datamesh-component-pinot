import './app.css'
import PinotGridApp from './PinotGridApp.svelte'
/**
 * see: https://blog.logrocket.com/build-web-components-svelte/
 * "The final step is to import our custom components in the Svelte main.js file so that they are generated at build time"
 * 
 * so ... 
 */
import Card from "./lib/PinotCard.svelte";

const pinotGridApp = new PinotGridApp({
  target: document.getElementById('webcomponent-app'),
})

export default pinotGridApp
