//> using scala "3.3.1"
//> using lib "com.lihaoyi::cask:0.9.1"
//> using lib "com.lihaoyi::upickle:3.0.0"
//> using lib "com.lihaoyi::scalatags:0.12.0"
//> using lib "org.apache.pinot:pinot-java-client:1.0.0"
//> using lib "org.apache.logging.log4j:log4j-api:2.21.0"
//> using lib "org.apache.logging.log4j:log4j-core:2.21.0"

import org.apache.pinot.client.*
import upickle.*
import upickle.default.{macroRW, ReadWriter as RW, *}

import java.time.*
import java.time.format.*
import scala.util.*
import scala.util.Properties.*

import scalatags.Text.all._

/** package/run with:
  * {{{
  *   which scala-cli || brew install Virtuslab/scala-cli/scala-cli
  *   scala-cli package Server.scala -o app.jar -f --assembly
  *   java -jar app.jar
  * }}}
  *
  * or:
  *
  * {{{scala-cli Server.scala}}}
  *
  * scala-cli setup-ide
  */
object Server extends cask.MainRoutes {

  private val logger = org.slf4j.LoggerFactory.getLogger(getClass)

  private def log(msg: String) = {
    println(s"out: $msg")
    logger.info(s"log: $msg")
  }

  log(s"Weird class: ${classOf[org.apache.logging.log4j.util.StackLocatorUtil]}")

  case class TestRequest(conn: String, query: String)
  object TestRequest {
    given rw: RW[TestRequest] = macroRW
  }

  class Row(result: RichResultSet, rowIndex: Int) {
    lazy val values               = (0 until result.columnCount).map(result.getString(rowIndex, _))
    override def toString: String = values.mkString(s"$rowIndex: [", ",", "]")
  }
  class RichResultSet(resultTableResultSet: ResultSet) {
    def getString(row: Int, col: Int) = resultTableResultSet.getString(row, col)

    val rowCount    = resultTableResultSet.getRowCount
    val columnCount = resultTableResultSet.getColumnCount
    def rows        = (0 until rowCount).map { r => Row(this, r) }
    val columnNames = (0 until columnCount).map(resultTableResultSet.getColumnName)

    def asList = {
      rows.map { r =>
        columnNames.zip(r.values).toMap
      }.toList
    }

    override def toString: String = {
      rows.mkString(s"""${rowCount} rows: [${columnNames.mkString(",")}]\n\t""", "\n\t", "\n")
    }
  }

  class PinotClient(pinotConnection: Connection) {
    def query(sql: String = "SELECT COUNT(*) FROM airlineStats") = {
      val pinotClientRequest              = new Request("sql", sql)
      val pinotResultSetGroup             = pinotConnection.execute(pinotClientRequest)
      val resultTableResultSet: ResultSet = pinotResultSetGroup.getResultSet(0)
      RichResultSet(resultTableResultSet)
    }
  }

  object PinotClient {
    def fromZookeeper(zkUrl: String) = {
      new PinotClient(ConnectionFactory.fromZookeeper(zkUrl))
    }
    def apply(zkUrl: String = "localhost:2181", pinotClusterName: String = "DefaultTenant") = {
      new PinotClient(ConnectionFactory.fromZookeeper(s"$zkUrl/$pinotClusterName"))
    }
  }
  def reply(body: ujson.Value) = cask.Response(
    data = body,
    headers = Seq("Access-Control-Allow-Origin" -> "*", "Content-Type" -> "application/json")
  )

  @cask.post("/test")
  def testConn(request: cask.Request) =
    val body = read[TestRequest](request.text())
    log("testing " + body)
    val client = PinotClient.fromZookeeper(body.conn)
    try {
      log("running query... ")
      val results = client.query(body.query)
      log(s"Got: ${results}")
      reply(writeJs(results.asList))
    } catch {
      case err =>
        log("bang: " + err)
        reply("{}")
    }

  @cask.staticFiles(
    "/ui",
    headers =
      Seq("Cache-Control" -> "max-age=31536000", "Content-Type" -> "text/html;charset=UTF-8")
  )
  def staticFileRoutes() = "ui"

  @cask.get("/health")
  def getHealthCheck() = s"${ZonedDateTime.now(ZoneId.of("UTC"))}"

  override def host: String = "0.0.0.0"

  override def port = envOrElse("PORT", propOrElse("PORT", 8088.toString)).toInt

  initialize()

  println(
    s""" 🚀 running pinot BFF on $host:$port {verbose : $verbose, debugMode : $debugMode }  🚀"""
  )
}
