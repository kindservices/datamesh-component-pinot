<svelte:options tag="my-card" />

<script>
  import Counter from "./Counter.svelte";
    // component props
    // Camel case not supported for props, see drawback section.
    export let card_title, card_desc;
  </script>
  
  <main>
    <div class="card-container">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="card-title">
              <h2>{card_title}</h2>
            </div>
          </div>
          <h3>{card_desc} </h3>
          <Counter />
        </div>
      </div>
    </div>
  </main>
  
  <style>
   .card {
      max-width: 350px;
      border-radius: 5px;
      box-shadow: 0 4px 6px 0 #00000033;
      padding: 0 0 10px 0;
    }
  
    .card-body {
      padding: 5px 10px;
    }
  
  </style>