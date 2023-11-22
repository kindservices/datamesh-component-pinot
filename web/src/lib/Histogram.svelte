<script lang="ts">
    import { onMount } from 'svelte';

    export let data : HistogramData = { cols : [] };
  
    // how much to rotate the x-axis text labels
    export let xAxisTextRotation = 315
  
    const margin = { gap: 10, colTextHeight: 160, colTextWidth : 60};

    const hack = {
       // a 'fudget factor' hack to align the y axis in the center of the text
       textHeightAdjustment : 7,
       textHeightLabelAdjustment : 20,
    }


    export let height = 100
    let gridHeight = height + hack.textHeightAdjustment
    export let width = 100


    let values = data.cols.map(c => {
      return c.value
    })
    let maxValue :number = values.reduce((acc, next) => Math.max(acc, next), 0)

    let totalWidth : number = width + margin.colTextWidth
    let totalHeight : number = height + margin.colTextHeight + hack.textHeightAdjustment

    export let style = {
      axisColor : "black",
      barStyle : "fill:rgb(0,0,255);stroke-width:1;stroke:rgb(0,0,0);opacity:0.8",
      yAxisColor : "red"
    }
    const xAxis = {
      x1 : margin.colTextWidth,
      y1 : totalHeight - margin.colTextHeight,
      x2 : margin.colTextWidth + width,
      y2 : totalHeight - margin.colTextHeight
    }

    const yAxis = {
      x1 : margin.colTextWidth,
      y1 : hack.textHeightAdjustment,
      x2 : margin.colTextWidth,
      y2 : totalHeight - margin.colTextHeight
    }


    export let colWidth = (width - (data.cols.length * margin.gap)) / data.cols.length

    // trying to auto-calculate the yValues is going to be tricky.
    //
    // consider the following table of actual 'max value' and a good choice for our top gradient:
    // 7 -> 10
    // 12 -> 15
    // 102 -> 110
    // 11234 -> 11240
    //
    // so, I guess for now let's just round up to the nearest 10
    export let yAxisMaxValue = Math.round((maxValue + 5) / 10) * 10
    
    // what to increment the yaxis values by
    export let yAxisIncrements = 10
    // the number of labels we show on the y axis
    export let yAxisDegredations = yAxisMaxValue / yAxisIncrements

  </script>
  
  {#if data.cols }
  <svg width={totalWidth} height={totalHeight}>

    <!-- x axis -->
    <line x1={xAxis.x1} y1={xAxis.y1} x2={xAxis.x2} y2={xAxis.y2} stroke={style.axisColor} />
    
    <!-- x axis labels -->
    {#each data.cols as col, i}
      {@const xIncrement = margin.gap + colWidth}
      {@const xOffset = margin.colTextWidth + (margin.gap + (colWidth / 2)) + (i * xIncrement)}
      {@const yOffset = xAxis.y1 + 10}
      <text text-anchor="end" dy=".71em" y={yOffset} x={xOffset} transform="rotate({xAxisTextRotation} {xOffset},{yOffset})">
        {col.label}
      </text>
    {/each}

    <!-- y axis -->
    <line x1={yAxis.x1} y1={yAxis.y1} x2={yAxis.x2} y2={yAxis.y2} stroke={style.yAxisColor} />

    <!-- y axis labels -->
    {#each {length: yAxisDegredations + 1} as _, i}
      {@const step = yAxisMaxValue / yAxisDegredations}
      {@const yIncrement = height / yAxisDegredations}
      {@const xOffset = 0}
      {@const yOffset = gridHeight - ((i * yIncrement) + hack.textHeightAdjustment)}
      <text text-anchor="start" alignment-baseline="baseline" dy=".71em" y={yOffset} x={xOffset} >
        {step * i}
      </text>
    {/each}

    <!-- y axis lines -->
    {#each {length: yAxisDegredations + 1} as _, i}
      {@const yIncrement = height / yAxisDegredations}
      {@const yOffset = gridHeight - (i * yIncrement)}
      <line x1={xAxis.x1} y1={yOffset} x2={xAxis.x2} y2={yOffset} stroke="blue" opacity="0.2" />
    {/each}

    <!-- histogram value bars -->
    {#each values as value, i}
      {@const xIncrement = margin.gap + colWidth}
      {@const xOffset = margin.colTextWidth + margin.gap + (i * xIncrement)}
      <!-- To compute a pixel height for our value, we need to multiply the value by our gridHeightMultiplier

        to compute the gridHeightMultiplier, that's the ratio of the (rounded up) value / yAxisMaxValue 
        multiplied by the gridHeight
        -->
      {@const barHeight = gridHeight * value / yAxisMaxValue}
      {@const yOffset = xAxis.y1 - barHeight}
      <rect x={xOffset} y={yOffset} width={colWidth} height={barHeight} style={style.barStyle} />
    {/each}


    <!-- histogram value labels -->
    {#each values as value, i}
      {@const xIncrement = margin.gap + colWidth}
      {@const xOffset = margin.colTextWidth + margin.gap + (colWidth / 2) + (i * xIncrement)}
      <!-- see value bar comment above -->
      {@const barHeight = gridHeight * value / yAxisMaxValue}
      {@const yOffset = xAxis.y1 - barHeight - hack.textHeightLabelAdjustment}
      <text text-anchor="middle" alignment-baseline="middle" dy=".71em" y={yOffset} x={xOffset} >
        {value}
      </text>
    {/each}
  </svg>

  {:else}
    <p>Computer says no: Histogram data error</p>
  {/if}
  