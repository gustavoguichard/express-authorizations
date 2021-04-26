import express, { NextFunction, Request, Response } from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

require('dotenv').config()

declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}
interface User {
  username: string
  passwordHash: string
}

let users: User[] = []
const app = express()
const publicFolder = path.join(__dirname, 'public')

app.set('port', process.env.PORT || 3000)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const auth = (req: Request, res: Response, next: NextFunction) => {
  const [stamp, token] = (req.headers?.auth as string)?.split(' ') || []
  if (stamp === 'JWT') {
    jwt.verify(token, process.env.SECRET_TOKEN as string, (err, decoded) => {
      if (err) return res.status(401).send()
      req.user = decoded as User
      console.log('authenticated as', (decoded as User).username)
      next()
    })
  } else return res.status(401).send()
}

app.get('/login', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

app.post('/auth/register', (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, passwordHash) => {
    if (err) return res.status(500).send()
    users.push({ username: req.body.username, passwordHash })
    res.redirect('/login')
  })
})

app.post('/auth/login', (req, res) => {
  const user = users.find((u) => u.username === req.body.username)
  if (user) {
    bcrypt.compare(req.body.password, user.passwordHash, (err, matched) => {
      if (matched && !err) {
        res.status(201).json({
          token: jwt.sign(
            { username: user.username },
            process.env.SECRET_TOKEN as string,
          ),
        })
      } else {
        res.status(401).send()
      }
    })
  } else {
    res.status(401).send()
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
