import express, { NextFunction, Request, Response } from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import bcrypt from 'bcrypt'
import session from 'express-session'

require('dotenv').config()

declare module 'express-session' {
  export interface SessionData {
    admin: boolean
  }
}

interface User {
  username: string
  passwordHash: string
}

let users = [{ username: 'example@email.com', password: '123123' }]
const app = express()
const publicFolder = path.join(__dirname, 'public')

app.set('port', process.env.PORT || 3000)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  session({
    secret: process.env.SECRET_TOKEN as string,
    cookie: { secure: false },
  }),
)

const auth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.admin) {
    next()
  } else {
    res.redirect('/login')
  }
}

app.get('/login', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

app.post('/auth/register', (req, res) => {
  users.push({ username: req.body.email, password: req.body.password })
  res.redirect('/login')
})

app.get('/auth/signout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login')
  })
})

app.post('/auth/login', (req, res) => {
  const user = users.find((u) => u.username === req.body.email)
  if (user && req.body.password === user.password) {
    req.session.admin = true
    res.redirect('/')
  } else {
    res.redirect('/login')
  }
})

app.get('/signup', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'))
})

app.get('/', auth, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use(express.static(publicFolder))

app.listen(app.get('port'), () =>
  console.log(`Listening at: http://localhost:${app.get('port')}/`),
)
