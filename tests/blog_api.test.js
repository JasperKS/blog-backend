const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const assert = require('node:assert')
const Blog = require('../models/blog')


const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there are some blogs saved initially', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('blogs have the unique identifier id instead of _id', async () => {
    const blogs = await helper.blogsInDb()
    blogs.forEach((blog) => assert(blog.id))
  })
})

describe('addition of a new blog', () => {
  test('a new blog can be added', async () => {
    const newBlog = {
      id: '6a422b3a1b54a676234d17f9',
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
      __v: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(blog => blog.title)
    assert(contents.includes('Type wars'))
  })

  test('a new blog without likes can be added', async () => {
    const newBlog = {
      title: 'Blog 1',
      author: 'Blog 1 Author',
      url: 'http://google.ca',
      __v: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const blog = blogsAtEnd.find(blog => blog.title === 'Blog 1')
    assert.strictEqual(blog.likes, 0)
  })

  test('a new blog without title cannot be added', async () => {
    const newBlog = {
      author: 'Blog No Title Author',
      url: 'http://google.ca',
      __v: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('a new blog without url cannot be added', async () => {
    const newBlog = {
      title: 'Blog No URL',
      author: 'Blog No URL Author',
      __v: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    const contents = blogsAtEnd.map(r => r.title)
    assert(!contents.includes(blogToDelete.title))
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  })
})

describe('updating a specific blog', () => {
  test('success with status code 200 if title is updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToEdit = blogsAtStart[0]

    const updatedBlog = {
      ...blogToEdit,
      title: 'Edited Title'
    }

    await api
      .put(`/api/blogs/${blogToEdit.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogInDb = await helper.blogById(blogToEdit.id)
    assert.strictEqual(blogInDb.title, updatedBlog.title)
  })

  test('success with status code 200 if author is updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToEdit = blogsAtStart[0]

    const updatedBlog = {
      ...blogToEdit,
      author: 'Edited Author'
    }

    await api
      .put(`/api/blogs/${blogToEdit.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogInDb = await helper.blogById(blogToEdit.id)
    assert.strictEqual(blogInDb.author, updatedBlog.author)
  })

  test('fails with status code 404 if blog does not exit', async () => {
    const validNonExistingId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${validNonExistingId}`)
      .expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})