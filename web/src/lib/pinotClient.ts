import { parseCountByBucketResponse, formatter } from "./transform"
import type { HistogramData, ParsedCountResponse } from "./types"
import { LocalDateTime, ZoneOffset } from '@js-joda/core'
import { pinotBrokerHost, dashboardHost } from './settings'

export const fetchData = async (pinotBrokerHost : string, range : BucketTimeRange) : HistogramData => {

  const fromMillis = range.fromEpochSeconds * 1000
  const toMillis = range.toEpochSeconds * 1000

  const response = await queryPinotViaProxy(pinotBrokerHost, fromMillis, toMillis, range.bucketSizeMinutes)
  
  console.log(`parsing ${JSON.stringify(response, null, 2)}`)
  const parsed = parseCountByBucketResponse(response)

  const histogram = asHistogram(range, parsed)

  return histogram
}

const queryPinotViaProxy = async (pinotBrokerHost : string, fromMillis : number, toMillis : number, bucketSizeMinutes : number) => {

    const url = `${pinotBrokerHost}/count/${fromMillis}/${toMillis}/${bucketSizeMinutes}`
    
    const proxyRequest = {
      proxy : url,
      method : "GET",
      headers : { "Content-Type" : "application/json"},
      body : null
    }

    return await fetch(`${dashboardHost}/api/proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proxyRequest)
    }).then(async response => {
      console.log(`Got ${response.status} from ${dashboardHost}/api/proxy`)
      if (!response.ok) {
        console.log("throwing for proxy...")
        throw new Error(`POST to ${dashboardHost}/api/proxy failed w/ status ${response.status}`)
      }
      
      const jason = await response.json()
      return jason
    })
}

export const asHistogram = (range : BucketTimeRange, response : ParsedCountResponse) : HistogramData => {

  const expectedKeys = sortedHistogramKeys(range, response)
  
  console.log(`transforming ${response.min} to ${response.max} with ${response.countByTimestamp.size} yields ${expectedKeys.length} keys: ${JSON.stringify(expectedKeys)}`)

  const entries = expectedKeys.map(key => {
    const value = response.countByTimestamp.get(key)
    return { label : formatter.format(key), value: value || 0 }
  })

  const retValue = {
    cols : entries
  }

  console.log(`${JSON.stringify(expectedKeys)} ==> ${JSON.stringify(entries)}`)

  return retValue
}


/**
 * This is a function which takes (1) the user-specified time range and (2) the response from the query 
 * and returns a sorted list of the LocalDateTime keys to use in our histogram.
 * 
 * 
 * Displaying timestamp columns is potentially error prone, as the LocalDateTime keys returned from the server 
 * may differ (if ever so slightly) from the keys we expect to display (e.g. the last hour in 10 minute increments)
 * 
 * what we'd LIKE to do is to iterate time from min to max by 'bucketSizeMinutes'.
 * 
 * what could happen though is:
 * 1) our bucketSize doesn't match what was brought back from the query
 * 2) the 'equals' lookup for our timestamp doesn't work -- perhaps some millisecond quirk
 * *) any number of other things the future evolution of this code could break
 * 
 * SO - instead of silently losing data, let's instead:
 * go from min to max by 'bucketSizeMinutes' as we wanted, BUT also include the keys (dates)
 * from the data response so they're still part of the columns
 * 
 * @param range our time range (e.g. the user-specified range)
 * @param response our query response
 * @returns 
 */
const sortedHistogramKeys = (range : BucketTimeRange, response : ParsedCountResponse) => {
  var expectedKeys : Set<LocalDateTime> = new Set()


  response.countByTimestamp.forEach((value, key) => {

    // belt-and-braces range check

    const timestamp = key.toEpochSecond(ZoneOffset.UTC)
    if (timestamp < range.fromEpochSeconds || timestamp > range.toEpochSeconds) {
       console.error(`QUERY ERROR: manually filtering out ${key} as key ${timestamp} is not between ${range.fromDate} and ${range.toDate}`)
    } else {
       if (expectedKeys.size < range.numberOfSectionsInOurGraph) {
         console.log(`adding ${key} as it's between ${range.fromDate} and ${range.toDate}`)
         expectedKeys.add(key)
       } else {
        console.log(`NOT adding ${key} as we're already showing too many results`)
       }
    }
  })
  

  if (response.min && response.max) {
    var key = response.min
    const max = response.max.toEpochSecond(ZoneOffset.UTC)
    var time = key.toEpochSecond(ZoneOffset.UTC)

    while (time <= max) {
      if (expectedKeys.size < range.numberOfSectionsInOurGraph) {
        console.log(`adding synthetic ${key} as it's between ${range.fromDate} and ${range.toDate}`)
        expectedKeys.add(key)
      } else {
        // console.log(`NOT adding synthetic ${key} as we're already showing too many results`)
      }
      key = key.plusMinutes(range.bucketSizeMinutes)
      time = key.toEpochSecond(ZoneOffset.UTC)
    }
  } else {
    console.log(`min and max are not truthy: ${response.min} to ${response.max}`)
  }

  const asArray = Array.from(expectedKeys)
  asArray.sort((a,b) => a.toEpochSecond(ZoneOffset.UTC) - b.toEpochSecond(ZoneOffset.UTC))
  return asArray
}
