<svelte:options tag="kafka-test-widget" />
<script type="ts">
    import {publishToKafka} from './kafkaRestClient'
    
    let topic = 'user-tracking-data';
    let slug = '/foo/bar';
    let headers = [];
    let queryParams = [];
    let hostname = "https://some-website.com"

    $: record = {
          timestampInEpoch : Date.now(),
          header : headers,
          queryParams : queryParams,
          slug : slug,
          hostname : hostname
        };

    $: recordJson = JSON.stringify(record, null, 2)

    export let userMessage = '';

    const removeHeader = (i) => {
      headers.splice(i, 1);
      headers = headers;
    }
    
    const removeQueryParam = (i) => {
      queryParams.splice(i, 1);
      queryParams = queryParams;
    }
    
    const addQueryParam = () => {
      queryParams.push({key : `key${queryParams.length + 1}`, value : `value${queryParams.length + 1}`});
      queryParams = queryParams;
    }

    const addHeader = () => {
      headers.push({key : `key${headers.length + 1}`, value : `value${headers.length + 1}`});
      headers = headers;
    }
  
    const postMessage = async () => {
      try {
        // refresh our timestamp
        record.timestampInEpoch = Date.now();
        const response = await publishToKafka(topic, `key-${record.timestampInEpoch}`, record)
  
        if (!response.ok) {
          userMessage = 'Failed to post message to Kafka:' + response.statusText;
        } else {
          userMessage = `Record published to ${topic}: ${JSON.stringify(response, null, 2)}`;
        }
      } catch (error) {
        userMessage = 'Error posting message to Kafka:' + error;
      }

      setTimeout(() => {
        userMessage = "";
      }, 1500);
    };
  </script>
  
  <main>
    <h1>Post Message</h1>
    <div class='form'>
      <div class="field">Topic: <input type="text" bind:value={topic} /></div>
      <div class="field">hostname: <input type="text" bind:value={hostname} /></div>
      <div class="field">slug: <input type="text" bind:value={slug} /></div>
      <h3>{headers.length} {#if headers.length == 1}Header {:else}Headers{/if} <button on:click={addHeader}>Add Header</button></h3>
      
      {#each headers as h, i}
      <div class="field">
          <a href="void" on:click={e => removeHeader(i)} >remove</a>&nbsp;
        <input class="entry" bind:value={headers[i].key} on:input={e => headers[i].key = e.target.value} >
        = 
       <input class="entry" bind:value={headers[i].value} on:input={e => headers[i].value = e.target.value} >
      </div>
      {/each}
      
      <h3>{queryParams.length} Query Params <button on:click={addQueryParam}>Add Query Param</button></h3>
      
      {#each queryParams as qp, i}
      <div class="field">
        <a href="void" on:click={e => removeQueryParam(i)} >remove</a>&nbsp;
        <input class="entry" bind:value={queryParams[i].key} on:input={e => queryParams[i].key = e.target.value} >
         = 
        <input class="entry" bind:value={queryParams[i].value} on:input={e => queryParams[i].value = e.target.value} >
      </div>
      {/each}
      
      
      <div class="entry">
        <h4>Record:</h4>
      </div>
      <div class="entry">        
        <pre style="font-size: 0.7em; font: Courier; line-height: 1em">{recordJson}</pre>
      </div>
      <div class="entry">
        <button on:click={postMessage}>Post Message</button>
      </div>
      <p>{userMessage}</p>
    </div>
  </main>
  
  <style>
    .entry {
      border : solid 1 blue
    }
    .form {
      display: flex;
      align-items: center; 
    }
    .field {
      flex-direction: column;
    }
    main {
      align-items: stretch; 
      display: flex;
      flex-direction: column;
      vertical-align: top;
      padding: 1em;
      max-width: 240px;
      margin: 0 auto;
    }
  
  </style>
  