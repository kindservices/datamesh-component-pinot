import { LocalDateTime, Duration } from '@js-joda/core'

// this is the data representing the 'to' and 'from' time range, both at minute granularity and 
// as an ISO string
type BucketTimeRange = {
    // the granularity of our histogram - how many sections do we want to chop up the time into/show?
    numberOfSectionsInOurGraph : number;

    // how 'big' we want the time buckets in minutes (e.g. number of hits per X minutes)
    bucketSizeMinutes: number;

    fromEpochSeconds: number;
    toEpochSeconds: number;

    fromDate: LocalDateTime;
    toDate: LocalDateTime;
  };

type SliderRange = {
    // the minimum selected slider value as a percentage - a number between 0.0 and 1.0
    minPercent : number;

    // the maximum selected slider value as a percentage - a number between 0.0 and 1.0
    maxPercent : number;
};

type HistogramEntry = {
    label : string;
    value : number;
}
type HistogramData = {
    cols : Array<HistogramEntry>;
}

type ParsedCountResponse = {
    countByTimestamp : Map<LocalDateTime, number>;
    min : LocalDateTime | null;
    max : LocalDateTime | null;
}