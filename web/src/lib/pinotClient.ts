import { parseCountByBucketResponse, formatter } from "./transform"
import type { HistogramData, ParsedCountResponse } from "./types"
import { LocalDateTime, ZoneOffset } from '@js-joda/core'
import { pinotBrokerHost, dashboardHost } from './settings'

export const fetchData = async (pinotBrokerHost : string, range : BucketTimeRange) : HistogramData => {

  const fromMillis = range.fromEpochSeconds * 1000
  const toMillis = range.toEpochSeconds * 1000

  const response = queryPinotViaProxy(pinotBrokerHost, fromMillis, toMillis, range.bucketSizeMinutes)
  
  const parsed = parseCountByBucketResponse(response)

  const histogram = asHistogram(range, parsed)

  return histogram;
}

const queryPinotViaProxy = async (pinotBrokerHost : string, fromMillis : number, toMillis : number, bucketSizeMinutes : number) => {
  // NOTE: Don't do this! SQL injection!
  const sql = `SELECT bucket, COUNT(*) as count FROM (
    SELECT DATETIMECONVERT(timestampInEpoch,'1:MILLISECONDS:EPOCH',
           '1:MILLISECONDS:SIMPLE_DATE_FORMAT:yyyy-MM-dd HH:mm:ss.SSS','${bucketSizeMinutes}:MINUTES') AS bucket,
           slug
    FROM usertrackingdata
    WHERE timestampInEpoch >= ${fromMillis}
    AND  timestampInEpoch <= ${toMillis}
) GROUP BY bucket`


    const requestBody = {
      "sql": sql,
      "queryOptions": "useMultistageEngine=true"
    }
    // TODO - call pinot instead of this test data
    console.log("fetching " + JSON.stringify(requestBody,null,2))
    
    const proxyRequest = {
      proxy : `${pinotBrokerHost}/query/sql`,
      method : "POST",
      headers : { "Content-Type" : "application/json"},
      body : requestBody
    }

    return await fetch(`${dashboardHost}/api/proxy`, {
      method: 'POST',
      body: JSON.stringify(proxyRequest)
    }).then(response => {
      console.log(`Got ${response.status} from ${dashboardHost}/api/proxy`)
      return response.json()
      })
  .catch(error => {
    console.log(`Error calling proxy ${pinotBrokerHost} from ${dashboardHost}/api/proxy: ${error}`)
    throw error
  })
}

const queryPinotBFF = async (pinotBrokerHost : string, fromMillis : number, toMillis : number, bucketSizeMinutes : number) => {

  const url = `${pinotBrokerHost}/count/${fromMillis}/${toMillis}/${bucketSizeMinutes}`
  return await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => {
    console.log(`Got ${response.status} from ${pinotBrokerHost}`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return response.json()
  })
  .catch(error => {
    console.error(`Error fetching from ${url}:`, error)
    throw error
  })
}


// displaying timestamp columns is going to be potentially error prone.
// what we'd LIKE to do is to iterate time from min to max by 'bucketSizeMinutes'.
//
// what could happen though is:
// 1) our bucketSize doesn't match what was brought back from the query
// 2) the 'equals' lookup for our timestamp doesn't work -- perhaps some millisecond quirk
// *) any number of other things the future evolution of this code could break
//
// SO - instead of silently losing data, let's instead:
// go from min to max by 'bucketSizeMinutes' as we wanted, BUT also include the keys (dates)
// from the data response so they're still part of the columns
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
