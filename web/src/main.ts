import './app.css'
import App from './App.svelte'
/**
 * see: https://blog.logrocket.com/build-web-components-svelte/
 * "The final step is to import our custom components in the Svelte main.js file so that they are generated at build time"
 * 
 * so ... 
 */
import Button from "./lib/Button.svelte";
import Card from "./lib/Card.svelte";

const app = new App({
  target: document.getElementById('webcomponent-app'),
})

export default app
