import express from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'

// data managed by server
type ParticipantSet = Set<string>
const participantLists: Record<string, ParticipantSet> = {}
let participantListCount = 0
function nextListId() {
  return String(participantListCount++)
}

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
app.get("/lists", (req, res) => {
  res.status(200).json(Object.keys(participantLists))
})

app.post("/list", (req, res) => {
  const listId = nextListId()
  participantLists[listId] = new Set<string>()
  res.status(200).json({ listId })
})

app.get("/list/:listId", (req, res) => {
  const list = participantLists[req.params.listId]
  if (!list) {
    res.status(404).json({ status: "error" })
    return
  }
  res.status(200).json([...list])
})

app.put("/list/:listId/participant/:name", (req, res) => {
  const list = participantLists[req.params.listId]
  if (!list) {
    res.status(404).json({ status: "error" })
    return
  }
  if (!req.params.name) {
    res.status(400).json({ status: "error" })
    return
  }
  list.add(req.params.name)
  res.status(200).json({ status: "ok", count: list.size })
})

app.delete("/list/:listId/participant/:name", (req, res) => {
  const list = participantLists[req.params.listId]
  if (!list) {
    res.status(404).json({ status: "error" })
    return
  }
  if (!req.params.name) {
    res.status(400).json({ status: "error" })
    return
  }
  list.delete(req.params.name)
  res.status(200).json({ status: "ok", count: list.size })
})

// start server
app.listen(port, () => {
  console.log(`Signup server listening on port ${port}`)
})
