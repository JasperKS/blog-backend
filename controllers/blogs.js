const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', (request, response) =>  {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

blogRouter.post('/', async (request, response) => {
  const body = request.body

  const blog = new Blog({
    ...body,
    likes: body.likes || 0
  })

  // blog.save()
  //   .then(result => {
  //     response.status(201).json(result)
  //   })
  //   .catch(error => next(error))
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const blog = await Blog.findByIdAndUpdate(request.params.id,
    { title, author, url, likes },
    { new: true, runValidators: true })

  !blog ? response.status(404).end() : response.status(200).json()
})

module.exports = blogRouter