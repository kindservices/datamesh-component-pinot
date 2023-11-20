
import {DateTimeFormatter, LocalDateTime, ZoneOffset} from "@js-joda/core";

export const formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")
export const timeFmt = DateTimeFormatter.ofPattern("HH:mm:ss");
const parseDate = (d8) => {
    try {
        return LocalDateTime.from(formatter.parse(d8))
    } catch (e) {
        const message = `Error parsing '${d8}' as a date: ${e.message}`
        console.error(message)
        throw new Error(message, e)
    }
}

export const parseCountByBucketResponse = (pinotResponse) : ParsedCountResponse => {
    const rows = pinotResponse.resultTable.rows

    var countByTimestamp = new Map<LocalDateTime, number>();

    var minD8 : LocalDateTime = null
    var maxD8 : LocalDateTime = null
    // Iterate over the array and build up key/values into the Map
    for (const [key, value] of rows) {
        
        const d8 = parseDate(key)
        countByTimestamp = countByTimestamp.set(d8, value)
        if (!minD8 || d8.toEpochSecond(ZoneOffset.UTC) < minD8.toEpochSecond(ZoneOffset.UTC)) {
            minD8 = d8
        }
        if (!maxD8 || d8.toEpochSecond(ZoneOffset.UTC) > maxD8.toEpochSecond(ZoneOffset.UTC)) {
            maxD8 = d8
        }
    }

    return {
        countByTimestamp : countByTimestamp,
        min : minD8,
        max : maxD8
    }
}