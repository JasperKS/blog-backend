const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const blogsRouter = require('./controllers/blogs')
const morgan = require('morgan')
const url = config.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB', error.message)
  })

morgan.token('body', function getBody (req) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-lenght] - :response-time ms :body'))
app.use(cors())
app.use(express.json())
app.use('/api/blogs', blogsRouter)

module.exports = app