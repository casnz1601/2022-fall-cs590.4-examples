import express from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'

// data managed by server
const nameList = new Set<string>()

// set up Express
const app = express()
const port = 8083
app.use(bodyParser.json())

// set up Pino logging
const logger = pino({
  transport: {
    target: 'pino-pretty'
  }
})
app.use(expressPinoLogger({ logger }))

// app routes
app.get('/', (req, res) => {
  res.status(200).json([...nameList])
})

app.put("/signup", (req, res) => {
  if (typeof req.body.name === "string") {
    nameList.add(req.body.name)
    res.status(200).json({ status: "ok", count: nameList.size })
  } else {
    req.log.error("malformed body: " + JSON.stringify(req.body))
    res.status(400).json({ status: "error" })
  }
})

// start server
app.listen(port, () => {
  console.log(`Signup server listening on port ${port}`)
})
