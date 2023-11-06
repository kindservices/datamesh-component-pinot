<svelte:options customElement="example-graph" />

<script lang="ts">
    import Histogram from './Histogram.svelte';
    import SliderBar from './SliderBar.svelte';

    let width = 1200
    let height =800

    let range = {
      minPercent : 0,
      maxPercent : 100
    }
    
    function rangeChanged(event) {
      range = { ...range, ...event.detail }

      let changed = previousRange.from != firstCol || previousRange.to != lastCol
      if (changed) {
        previousRange = {
          from : firstCol,
          to : lastCol
        }
        updateHistogram = true
      } else {
        updateHistogram = false
      }
    }

    let data = {
      cols : [
        { label : "first", value: 10 },
        { label : "second", value: 102 },
        { label : "third", value: 0 },
        { label : "fourth", value: 53 },
        { label : "fifth", value: 61 }
      ]
    }

    let previousRange = {
      from : 0,
      to : data.cols.length
    }

    // hack!
    // without the 'if', only part of the <Histogram ... /> was being updated!
    let updateHistogram = false
    
    $: firstCol = Math.round(range.minPercent * data.cols.length)
    $: lastCol = Math.round(range.maxPercent * data.cols.length)
    $: adjustedData = {
      cols : data.cols.slice(firstCol, lastCol + 1)
    }

    
</script>

<!--
<main bind:this={container}>
-->
<main >
  {#if (updateHistogram)}
    <Histogram data={adjustedData} height={height * 0.8} {width} />
  {:else}
    <Histogram data={adjustedData} height={height * 0.8} {width} />
  {/if}
  <SliderBar on:rangeChanged={rangeChanged} width={1200} barWidth={1200} />
  <br/>

  firstCol: {firstCol}
  lastCol: {lastCol}
  width: {width} X {height}

</main>