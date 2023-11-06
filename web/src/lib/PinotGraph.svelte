<svelte:options customElement="pinot-graph" />

<script lang="ts">
    import { LocalDateTime, Duration, ZoneOffset } from '@js-joda/core'
    import Histogram from './Histogram.svelte'
    import SliderBar from './SliderBar.svelte'
    import { pinotBFFHost } from './settings'
    import { fetchData } from './pinotClient'
    import { fetchFakeData } from './pinotClientFake'


    // ================================ our time range ================================
    // this will be specified externally from an initial query
    //
    export let earliestDate = LocalDateTime.of(2023, 11, 6, 14, 28)
    export let latestDate = LocalDateTime.of(2023, 11, 7, 16, 28)
    let fullTimeSpanInSeconds = Duration.between(earliestDate, latestDate).seconds()

    // how many bars do we want to see in our graph?
    // this is our granularity
    export let numberOfSectionsInOurGraph = 15
    let bucketSizeMinutes = Math.round((fullTimeSpanInSeconds / 60) / numberOfSectionsInOurGraph)

    // this value gets updated when the debounced slider is adjusted
    // it is used to make DB queries
    let timeRange : BucketTimeRange = {
       numberOfSectionsInOurGraph : numberOfSectionsInOurGraph,
       bucketSizeMinutes : 0,
       fromEpochSeconds : 0,
       fromDate : LocalDateTime.of(0,1,1),
       toEpochSeconds : 0,
       toDate : LocalDateTime.of(0,1,1),
    }


    /**
     * return a BucketTimeRange for the given user selection
     */
    const updatedTimeRange = (userSelection : SliderRange) : BucketTimeRange => {
        const spread = userSelection.maxPercent - userSelection.minPercent
        const fromSecondsOffset = Math.round(fullTimeSpanInSeconds * userSelection.minPercent)
        const toSecondsOffset = Math.round(fullTimeSpanInSeconds * userSelection.maxPercent)

        const from = earliestDate.plusSeconds(fromSecondsOffset)
        const to = earliestDate.plusSeconds(toSecondsOffset)

        // our bucket-size (e.g. X, where X is the cound per X) is going to be based on:
        // the number of minutes in our slider fraction, divided by the number of values
        // we want to see in our histogram.
        const numberOfMinutes = fullTimeSpanInSeconds * spread / 60
        bucketSizeMinutes = Math.round(numberOfMinutes / numberOfSectionsInOurGraph)

        return {
          numberOfSectionsInOurGraph : numberOfSectionsInOurGraph,
          bucketSizeMinutes : bucketSizeMinutes,
          fromEpochSeconds : from.toEpochSecond(ZoneOffset.UTC),
          fromDate : from,
          toEpochSeconds : to.toEpochSecond(ZoneOffset.UTC),
          toDate : to,
        }
    }

    let width  = 600
    let height = 400

    // our slider range
    let range : Range = {
      minPercent : 0,
      maxPercent : 1
    }

    // ======================== debounce code ========================
    // see https://svelte.dev/repl/f55e23d0bf4b43b1a221cf8b88ef9904?version=3.12.1
    let debounceTimer;
    const debounce = v => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        refreshData()
      }, 100);
    }

    // ======================== our callback from the slider controller ========================
    // we 'debounce' the user updates (see above). 
    // when the user stops messing w/ the range, we trigger a 'refreshData()' call
    function rangeChanged(event) {
      range = { ...range, ...event.detail }
      debounce(range)
    }

    // tracking a reactive property as a 'promise' is how we bridge the gap between user-space events (e.g synchronous code)
    // and asynchronous code (e.g. triggering a server call)
    let dataPromise : Promise 
    const refreshData = () => {
      timeRange = updatedTimeRange(range)
      if (pinotBFFHost == "fake") {
        dataPromise = fetchFakeData(timeRange)
      } else {
        dataPromise = fetchData(pinotBFFHost, timeRange)
      }
    }

</script>

<main>

{#await dataPromise}
  Loading data from {pinotBFFHost}
{:then data}
    <Histogram data={data} height={height * 0.8} {width} />
    <br/>
    <SliderBar on:rangeChanged={rangeChanged} width={width} barWidth={width} />

    <p>Bucket size: {bucketSizeMinutes}</p>
    Time Range is:
  <pre>
    {JSON.stringify(timeRange, null, 2)}
  </pre>
{:catch someError}
  Error querying backend at {pinotBFFHost}: {someError.message}
{/await}
  <br/>

  <button on:click={refreshData}>Refresh</button>

</main>