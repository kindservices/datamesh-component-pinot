//> using testFramework "utest.runner.Framework"
//> using lib "com.lihaoyi::utest:0.8.2"

import utest._

object HelloTests extends TestSuite{

  val aggResponse =  """
  {
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
            [ "2023-11-21 10:19:00.000", 8 ],
            [ "2023-11-20 21:38:00.000", 4 ],
            [ "2023-11-21 17:00:00.000", 4 ],
            [ "2023-11-21 10:38:00.000", 3 ]
        ]
    }
}
"""
  val tests = Tests{
    "parse response" - {
      val response = ujson.read(aggResponse)
      val ujson.Arr(values) = App.parseBucketResponse(response)
      assert(values.size == 4)
      assert(values.head("bucket").str == "2023-11-21 10:19:00.000")
      assert(values.head("count").num == 8)
    }
  }
}