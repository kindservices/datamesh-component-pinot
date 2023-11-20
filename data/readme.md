# Data Model
The salient points of information we'll want to track are:
 * timestamp
 * hostname
 * slug (the part of the URL after the host)
 * query params (the arbitrary key/value pairs in the web query)

 You can see how these fields are defined in our pinot DB in the [schema](./schema.json)

Check out the [queries](./queries.md) for how we ask questions of the data.