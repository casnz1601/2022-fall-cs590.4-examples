import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import { Collection, Db, MongoClient, ObjectId } from 'mongodb'
import { DraftOrder, Order, possibleIngredients } from './data'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import localStrategy from 'passport-local'

// set up Mongo
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const client = new MongoClient(mongoUrl)
let db: Db
let customers: Collection
let orders: Collection
let operators: Collection

// set up Express
const app = express()
const port = parseInt(process.env.PORT) || 8095
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// set up session
app.use(session({
  secret: 'a just so-so secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },

  // comment out the following to default to a memory-based store, which,
  // of course, will not persist across load balanced servers
  // or survive a restart of the server
  store: MongoStore.create({
    mongoUrl,
    ttl: 14 * 24 * 60 * 60 // 14 days
  })
}))

app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user: any, done: any) => {
  console.log("serializeUser", user)
  done(null, user)
})
passport.deserializeUser((user: any, done: any) => {
  console.log("deserializeUser", user)
  done(null, user)
})
passport.use(new localStrategy.Strategy(
  async (username, password, done) => {
    console.log("checking", username, password)
    const customer = await customers.findOne({ _id: username })
    if (customer == null) {
      done(null, false)
      return
    }
      // this is just a demo -- obviously really awful password checking logic
    done(null, username === password ? username : false)
  }
))

// set up Pino logging
const logger = pino({
  transport: {
    target: 'pino-pretty'
  }
})
app.use(expressPinoLogger({ logger }))

function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401)
    return
  }

  next()
}

// app routes
app.get("/api/login", (req, res) => {
  res.send(`
<form method="POST">
Username: <input name="username" value="alice">
<br>
Password: <input name="password" type="password">
<br>
<input type="submit" value="Login">
</form>   
  `)
})

app.post(
  "/api/login", 
  passport.authenticate("local", { failureRedirect: "/api/login" }), 
  (req, res) => res.redirect("/")
)

app.get("/api/logout", (req, res) => {
  res.send(`
<form method="POST">
<input type="submit" value="Logout">
</form>   
  `)
})

app.post(
  "/api/logout", 
  (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err)
      }
      res.redirect("/")
    })
  }
)

app.get("/api/user", (req, res) => {
  res.json({ user: req.user })
})

app.get("/api/possible-ingredients", checkAuthenticated, (req, res) => {
  res.status(200).json(possibleIngredients)
})

app.get("/api/orders", checkAuthenticated, async (req, res) => {
  res.status(200).json(await orders.find({ state: { $ne: "draft" }}).toArray())
})

app.get("/api/customer", checkAuthenticated, async (req, res) => {
  const _id = req.user
  const customer = await customers.findOne({ _id })
  if (customer == null) {
    res.status(404).json({ _id })
    return
  }
  customer.orders = await orders.find({ customerId: _id, state: { $ne: "draft" } }).toArray()
  res.status(200).json(customer)
})

app.get("/api/operator", checkAuthenticated, async (req, res) => {
  const _id = req.user
  const operator = await operators.findOne({ _id })
  if (operator == null) {
    res.status(404).json({ _id })
    return
  }
  operator.orders = await orders.find({ operatorId: _id }).toArray()
  res.status(200).json(operator)
})

app.get("/api/customer/draft-order", checkAuthenticated, async (req, res) => {
  const customerId = req.user

  // TODO: validate customerId

  const draftOrder = await orders.findOne({ state: "draft", customerId })
  res.status(200).json(draftOrder || { customerId, ingredients: [] })
})

app.put("/api/customer/draft-order", checkAuthenticated, async (req, res) => {
  const order: DraftOrder = req.body

  // TODO: validate customerId

  const result = await orders.updateOne(
    {
      customerId: req.user,
      state: "draft",
    },
    {
      $set: {
        ingredients: order.ingredients
      }
    },
    {
      upsert: true
    }
  )
  res.status(200).json({ status: "ok" })
})

app.post("/api/customer/submit-draft-order", checkAuthenticated, async (req, res) => {
  const result = await orders.updateOne(
    {
      customerId: req.user,
      state: "draft",
    },
    {
      $set: {
        state: "queued",
      }
    }
  )
  if (result.modifiedCount === 0) {
    res.status(400).json({ error: "no draft order" })
    return
  }
  res.status(200).json({ status: "ok" })
})

app.put("/api/order/:orderId", checkAuthenticated, async (req, res) => {
  const order: Order = req.body

  // TODO: validate order object

  const condition: any = {
    _id: new ObjectId(req.params.orderId),
    state: { 
      $in: [
        // because PUT is idempotent, ok to call PUT twice in a row with the existing state
        order.state
      ]
    },
  }
  switch (order.state) {
    case "blending":
      condition.state.$in.push("queued")
      // can only go to blending state if no operator assigned (or is the current user, due to idempotency)
      condition.$or = [{ operatorId: { $exists: false }}, { operatorId: order.operatorId }]
      break
    case "done":
      condition.state.$in.push("blending")
      condition.operatorId = order.operatorId
      break
    default:
      // invalid state
      res.status(400).json({ error: "invalid state" })
      return
  }
  
  const result = await orders.updateOne(
    condition,
    {
      $set: {
        state: order.state,
        operatorId: order.operatorId,
      }
    }
  )

  if (result.matchedCount === 0) {
    res.status(400).json({ error: "orderId does not exist or state change not allowed" })
    return
  }
  res.status(200).json({ status: "ok" })
})

// connect to Mongo
client.connect().then(() => {
  console.log('Connected successfully to MongoDB')
  db = client.db("test")
  operators = db.collection('operators')
  orders = db.collection('orders')
  customers = db.collection('customers')

  // start server
  app.listen(port, () => {
    console.log(`Smoothie server listening on port ${port}`)
  })
})
