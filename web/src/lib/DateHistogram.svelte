<script >

  import { scaleBand, scaleLinear } from "d3-scale";
  import * as jsdate from "@js-joda/core";

  const formatter = jsdate.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
  const timeFmt = jsdate.DateTimeFormatter.ofPattern("HH:mm:ss");
  const asDate = (str) => jsdate.LocalDateTime.from(formatter.parse(str));
  
  let incrementInMinutes = 3
  let numBars = 10

  let range = Array.from({ length: numBars }, (_, index) => index + 1);

  // ==== data ====
  let minTime = asDate("2023-11-06 14:44:00.000");
  let maxTime = asDate("2023-11-06 15:24:00.000");
  $: xRangeBuckets = jsdate.Duration.between(minTime, maxTime).toMinutes() / incrementInMinutes;
  export let rows;
  const countByTimestamp = new Map();
  for (const [key, value] of rows) {
    countByTimestamp.set(key, value);
  }

  console.log(countByTimestamp);

  // settings
  const barWidth = 120;
  const width = 100 + (barWidth * numBars);
  const height = 600;

  const margin = { top: 20, right: 20, bottom: 20, left: 180 };
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;
  
  // $: xDomain = data.map((d) => d.country);
  // $: yDomain = data.map((d) => +d.population);

  $: yScale = scaleBand().domain(xDomain).range([0, innerHeight]).padding(0.1);
  $: xScale = scaleLinear()
    .domain([0, Math.max.apply(null, yDomain)])
    .range([0, innerWidth]);
</script>

<div>
  {#each range as r, i}
  {r}: {formatter.format(date.plusMinutes(i * incrementInMinutes))}
  <br/>
  {/each}
  
  
</div>
  
  <svg {width} {height}>
    <g transform={`translate(${margin.left},${margin.top})`}>
      {#each range as r, i}
        <g transform={`translate(${r * barWidth},0)`}>
          <line y2={innerHeight} stroke="black" />
          <text text-anchor="middle" dy=".71em" y={innerHeight + 3}>
            {timeFmt.format(date.plusMinutes(i * incrementInMinutes))}
          </text>

          <rect
            x="0"
            y=0
            width=10
            height={r}
          />
        </g>
      {/each}
      {#each data as d}
        <text
          text-anchor="end"
          x="-3"
          dy=".32em"
          y={yScale(d.country) + yScale.bandwidth() / 2}
        >
          {d.country}
        </text>
       
      {/each}
    </g>
  </svg>