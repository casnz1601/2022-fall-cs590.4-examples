import { createServer } from "http"
import { Server } from "socket.io"
import { Action, createEmptyGame, doAction, filterCardsForPlayerPerspective, Card } from "./model"
import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import { Collection, Db, MongoClient, ObjectId } from 'mongodb'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { Issuer, Strategy } from 'openid-client'
import passport from 'passport'
import { keycloak } from "./secrets"

if (process.env.PROXY_KEYCLOAK_TO_LOCALHOST) {
  // NOTE: this is a hack to allow Keycloak to run from the 
  // same development machine as the rest of the app. We have exposed
  // Keycloak to run off port 8081 of localhost, where localhost is the
  // localhost of the underlying laptop, but localhost inside of the
  // server's Docker container is just the container, not the laptop.
  // The following line creates a reverse proxy to the Keycloak Docker
  // container so that localhost:8081 can also be used to access Keycloak.
  require("http-proxy").createProxyServer({ target: "http://keycloak:8080" }).listen(8081)
}

// set up Mongo
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const client = new MongoClient(mongoUrl)
let db: Db

// set up Express
const app = express()
const server = createServer(app)
const port = parseInt(process.env.PORT) || 8095
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// set up Pino logging
const logger = pino({
  transport: {
    target: 'pino-pretty'
  }
})
app.use(expressPinoLogger({ logger }))

// set up session
const sessionMiddleware = session({
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
})
app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user: any, done: any) => {
  logger.info("serializeUser " + JSON.stringify(user))
  done(null, user)
})
passport.deserializeUser((user: any, done: any) => {
  logger.info("deserializeUser " + JSON.stringify(user))
  done(null, user)
})

function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401)
    return
  }

  next()
}

// set up Socket.IO
const io = new Server(server)

// convert a connect middleware to a Socket.IO middleware
const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next)
io.use(wrap(sessionMiddleware))

// hard-coded game configuration
const playerUserIds = ["dennis", "alice"]
let gameState = createEmptyGame(playerUserIds, 1, 2)

function emitUpdatedCardsForPlayers(cards: Card[], newGame = false) {
  gameState.playerNames.forEach((_, i) => {
    let updatedCardsFromPlayerPerspective = filterCardsForPlayerPerspective(cards, i)
    if (newGame) {
      updatedCardsFromPlayerPerspective = updatedCardsFromPlayerPerspective.filter(card => card.locationType !== "unused")
    }
    console.log("emitting update for player", i, ":", updatedCardsFromPlayerPerspective)
    io.to(String(i)).emit(
      newGame ? "all-cards" : "updated-cards", 
      updatedCardsFromPlayerPerspective,
    )
  })
}

io.on('connection', client => {
  const user = (client.request as any).session?.passport?.user
  logger.info("new socket connection for user " + JSON.stringify(user))
  if (!user) {
    client.disconnect()
    return
  }

  function emitGameState() {
    client.emit(
      "game-state", 
      playerIndex,
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
    )
  }
  
  console.log("New client")
  let playerIndex: number | "all" = playerUserIds.indexOf(user.preferred_username)
  if (playerIndex === -1) {
    playerIndex = "all"
  }
  client.join(String(playerIndex))
  
  if (typeof playerIndex === "number") {
    client.emit(
      "all-cards", 
      filterCardsForPlayerPerspective(Object.values(gameState.cardsById), playerIndex).filter(card => card.locationType !== "unused"),
    )
  } else {
    client.emit(
      "all-cards", 
      Object.values(gameState.cardsById),    
    )
  }
  emitGameState()

  client.on("action", (action: Action) => {
    if (typeof playerIndex === "number") {
      const updatedCards = doAction(gameState, { ...action, playerIndex })
      emitUpdatedCardsForPlayers(updatedCards)
    } else {
      // no actions allowed from "all"
    }
    io.to("all").emit(
      "updated-cards", 
      Object.values(gameState.cardsById),    
    )
    io.emit(
      "game-state", 
      null,
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
    )
  })

  client.on("new-game", () => {
    gameState = createEmptyGame(gameState.playerNames, 1, 2)
    const updatedCards = Object.values(gameState.cardsById)
    emitUpdatedCardsForPlayers(updatedCards, true)
    io.to("all").emit(
      "all-cards", 
      updatedCards,
    )
    emitGameState()
  })
})

// app routes
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
  res.json(req.user || {})
})

// connect to Mongo
client.connect().then(() => {
  logger.info('connected successfully to MongoDB')
  db = client.db("test")
  // operators = db.collection('operators')
  // orders = db.collection('orders')
  // customers = db.collection('customers')

  Issuer.discover("http://127.0.0.1:8081/auth/realms/game/.well-known/openid-configuration").then(issuer => {
    const client = new issuer.Client(keycloak)
  
    passport.use("oidc", new Strategy(
      { 
        client,
        params: {
          // this forces a fresh login screen every time
          prompt: "login"
        }
      },
      async (tokenSet: any, userInfo: any, done: any) => {
        logger.info("oidc " + JSON.stringify(userInfo))

        const _id = userInfo.preferred_username
        // const operator = await operators.findOne({ _id })
        // if (operator != null) {
        //   userInfo.roles = ["operator"]
        // } else {
        //   await customers.updateOne(
        //     { _id },
        //     {
        //       $set: {
        //         name: userInfo.name
        //       }
        //     },
        //     { upsert: true }
        //   )
        //   userInfo.roles = ["customer"]
        // }

        return done(null, userInfo)
      }
    ))

    app.get(
      "/api/login", 
      passport.authenticate("oidc", { failureRedirect: "/api/login" }), 
      (req, res) => res.redirect("/")
    )
    
    app.get(
      "/api/login-callback",
      passport.authenticate("oidc", {
        successRedirect: "/",
        failureRedirect: "/api/login",
      })
    )    

    // start server
    server.listen(port)
    logger.info(`Game server listening on port ${port}`)
  })
})
