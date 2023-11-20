import { parseCountByBucketResponse, formatter } from "./transform"
import type { HistogramData, ParsedCountResponse } from "./types"
import { LocalDateTime, ZoneOffset } from '@js-joda/core'


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

const asHistogram = (range : BucketTimeRange, response : ParsedCountResponse) : HistogramData => {


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

export const fetchFakeData = async (range : BucketTimeRange) : HistogramData => {
    // TODO - call pinot instead of this test data
    console.log("fetching fake data...")
    
    const response = parseCountByBucketResponse(exampleReponse)

    const histogram = asHistogram(range, response)

    return histogram;
  }

  const exampleReponse = {
    "resultTable": {
        "dataSchema": {
            "columnNames": [
                "bucket",
                "count"
            ],
            "columnDataTypes": [
                "STRING",
                "LONG"
            ]
        },
        "rows": [
            [
                "2023-11-06 14:44:00.000",
                234
            ],
            [
                "2023-11-06 15:16:00.000",
                2
            ],
            [
                "2023-11-06 15:08:00.000",
                12
            ],
            [
                "2023-11-06 15:04:00.000",
                71
            ],
            [
                "2023-11-06 15:00:00.000",
                55
            ],
            [
                "2023-11-06 14:32:00.000",
                27
            ],
            [
                "2023-11-06 15:24:00.000",
                102
            ],
            [
                "2023-11-06 15:28:00.000",
                19
            ],

            [
              "2023-11-07 14:44:00.000",
              234
          ],
          [
              "2023-11-07 15:16:00.000",
              2
          ],
          [
              "2023-11-07 15:08:00.000",
              12
          ],
          [
              "2023-11-07 15:04:00.000",
              71
          ],
          [
              "2023-11-07 15:00:00.000",
              55
          ],
          [
              "2023-11-07 14:32:00.000",
              27
          ],
          [
              "2023-11-07 15:24:00.000",
              102
          ],
          [
              "2023-11-07 15:28:00.000",
              19
          ]
        ]
    }
  }
  