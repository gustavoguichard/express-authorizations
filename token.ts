import express, { NextFunction, Request, Response } from 'express'
import path from 'path'

require('dotenv').config()
const app = express()
const publicFolder = path.join(__dirname, 'public')

app.set('port', process.env.PORT || 3000)

const auth = (req: Request, res: Response, next: NextFunction) => {
  if (req.query?.token && req.query?.token === process.env.SECRET_TOKEN) {
    return next()
  } else {
    return res.redirect('/login')
  }
}

app.get('/login', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'token-login.html'))
})

app.get('/', auth, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use(express.static(publicFolder))

app.listen(app.get('port'), () =>
  console.log(`Listening at: http://localhost:${app.get('port')}/`),
)
