<svelte:options tag="kafka-test-widget" />
<script>
    import {kafkaHost} from './settings'
    export let topic = 'example-topic';
    export let message = '';
    export let userMessage = '';
  
    const postMessage = async () => {
      try {
        const response = await fetch(`${kafkaHost}/topics/${topic}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/vnd.kafka.json.v2+json',
          },
          body: JSON.stringify({
            records: [
              {
                value: {
                  content: message,
                },
              },
            ],
          }),
        });
  
        if (!response.ok) {
          userMessage = 'Failed to post message to Kafka:' + response.statusText;
        } else {
          userMessage = 'Message posted to Kafka successfully.';
        }
      } catch (error) {
        userMessage = 'Error posting message to Kafka:' + error;
      }
    };
  </script>
  
  <main>
    <h1>Post Message to {topic}</h1>
    <div>Topic: <input type="text" bind:value={topic} /></div>
    <textarea bind:value={message}></textarea>
    <button on:click={postMessage}>Post Message</button>
    <p>{userMessage}</p>
  </main>
  
  <style>
    main {
      text-align: center;
      padding: 1em;
      max-width: 240px;
      margin: 0 auto;
    }
  
    textarea {
      width: 100%;
      margin-bottom: 1em;
    }
  </style>
  