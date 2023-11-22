//> using scala "3.3.1"
//> using lib "com.lihaoyi::requests:0.8.0"
//> using lib "com.lihaoyi::cask:0.9.1"
//> using lib "com.lihaoyi::upickle:3.0.0"

import cask.model.Response
import ujson.Value
import upickle.*
import upickle.default.{macroRW, ReadWriter as RW, *}

import java.time.*
import java.time.format.*
import java.util.concurrent.{Executors, ScheduledExecutorService, TimeUnit}
import scala.concurrent.ExecutionContext
import scala.util.*
import scala.util.Properties.*
import scala.util.control.NonFatal


// format: off
/**
  * This "backend for front-end" for querying Pinot
  * 
  * To test locally, have pinot up and running and port-forward the pinot broker on port 9000
  */
// format: on
def env(key: String, default: String = null) =
  def bang = sys.error(
    s"$key env variable not set: ${sys.env.mkString("\n", "\n", "\n")}\n properties:\n ${sys.props.mkString("\n")}"
  )

  sys.env.get(key).orElse(Option(default)).getOrElse(bang)

def countByBucket(
    url: String,
    fromMillis: Long,
    toMillis: Long,
    bucketSizeMinutes: Int
): ujson.Value = {
  require(fromMillis > 0)
  require(toMillis > 0)
  require(bucketSizeMinutes > 0)

  val sql = s"""SELECT bucket, COUNT(*) as count FROM (
                    SELECT DATETIMECONVERT(timestampInEpoch,'1:MILLISECONDS:EPOCH',
                           '1:MILLISECONDS:SIMPLE_DATE_FORMAT:yyyy-MM-dd HH:mm:ss.SSS','${bucketSizeMinutes}:MINUTES') AS bucket,
                           slug
                    FROM usertrackingdata
                    WHERE timestampInEpoch >= ${fromMillis}
                    AND  timestampInEpoch <= ${toMillis}
                ) GROUP BY bucket"""


  val response = query(url, sql)

  val jsonStr = response
    .ensuring(_.statusCode == 200, s"${url} returned ${response.statusCode}: $response")
    .text()

  ujson.read(jsonStr)
}

def queryStats(url: String): ujson.Value = {
  val response = query(url, """select min(timestampInEpoch) as minTimestamp, max(timestampInEpoch) as maxTimestamp, count(*) as totalCount from usertrackingdata limit 1""")

  val jsonStr = response
    .ensuring(_.statusCode == 200, s"${url} returned ${response.statusCode}: $response")
    .text()

  ujson.read(jsonStr)
}

// NOTE: Don't do this! SQL Injection-tastic.
// pinot has a 'proper' Java client, but we'll just use this for now for convenience
private def query(pinotBrokerUrl: String, sql : String): requests.Response = {
  val request = ujson.Obj("sql" -> ujson.Str(sql), "queryOptions" -> ujson.Str("useMultistageEngine=true"))

  println(s"count $pinotBrokerUrl using:\n${sql}\n")
  val started = System.currentTimeMillis
  val response = requests.post(
    s"$pinotBrokerUrl/query/sql",
    data = request,
    headers = Map(
      "Content-Type" -> "application/json",
      "Access-Control-Allow-Origin" -> "*" // TODO - security no-no, but hard-coded for now for port-forwarding/debugging
    )
  )
  val took = System.currentTimeMillis - started
  println(s"result took ${took}ms:\n\n ${response.text()}\n")
  response
}
object App extends cask.MainRoutes {

  val PinotUrl = env("PINOT_BROKER_HOSTPORT")

  def parseBucketResponse(responseBody : ujson.Value) : ujson.Arr = {
      val mapped = responseBody("resultTable")("rows").arr.map { row =>
        ujson.Obj(
            "bucket" -> row(0),
            "count" -> row(1)
        )
      }
     ujson.Arr(mapped.toArray:_*)
  }

  def reply(body: ujson.Value = ujson.Null, statusCode: Int = 200) = cask.Response(
    data = body,
    statusCode = statusCode,
    headers = Seq("Access-Control-Allow-Origin" -> "*", "Content-Type" -> "application/json")
  )

  @cask.get("/")
  def poorMansOpenAPI() = cask.Response(
    data = s"""
    <html>
    <ul>
  <li><a href="/health">GET /health</a></li>
  <li>GET /count/:fromEpoch/:toEpoch/:minutesPerBucket <-- query pinot between timestamps</li>
  <li><a href="/stats">GET /stats<a/> <-- min, max timestamps and total count</li>
  </ul>
  </html>
  """,
    statusCode = 200,
    headers = Seq("Access-Control-Allow-Origin" -> "*", "Content-Type" -> "text/html")
  )

  @cask.get("/count/:fromEpoch/:toEpoch/:minutesPerBucket")
  def countRange(fromEpoch: Long, toEpoch: Long, minutesPerBucket: Int) = reply {
    countByBucket(PinotUrl, fromEpoch, toEpoch, minutesPerBucket)
  }

  @cask.get("/group/:fromEpoch/:toEpoch/:minutesPerBucket")
  def group(fromEpoch: Long, toEpoch: Long, minutesPerBucket: Int) = reply {
    parseBucketResponse(countByBucket(PinotUrl, fromEpoch, toEpoch, minutesPerBucket))
  }

  /**
    * @return the min timestamp, max timestamp and total count
    */
  @cask.get("/stats")
  def stats() = reply{
    /**
      * returns e.g.
      * {{{
      * { "resultTable": { 
      *      "dataSchema":  ..., 
      *       "rows": [ 
      *          [ 1700517293880, 1700586174977, 19 ] 
      *       ] 
      *   }
      * }}}
      */
    val response = queryStats(PinotUrl)
    val firstRow = response("resultTable")("rows")(0)
    
    ujson.Obj("minEpoch" -> firstRow(0), "maxEpoch" -> firstRow(1), "total" -> firstRow(2))
  }

  // TODO - this isn't a great health check
  // we'd like to know if we can connect to pinot -- but also want to avoid cascading failures
  @cask.get("/health")
  def getHealthCheck() = s"${ZonedDateTime.now(ZoneId.of("UTC"))}"

  override def host: String = "0.0.0.0"

  override def port = envOrElse("PORT", propOrElse("PORT", 8081.toString)).toInt

  initialize()

  println(
    s""" 🚀 running Pinot BFF on $host:$port against pinot broker ${PinotUrl}  🚀"""
  )
}
