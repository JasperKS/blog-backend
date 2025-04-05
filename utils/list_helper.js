const _ = require('lodash')

const dummy = (blogs) => {
  return blogs.length === 0 ? 1 : 0
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((mostLikes, curr) =>
    (curr.likes > mostLikes.likes ? curr : mostLikes),
  blogs[0])
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return { author: null, blogs: 0 }

  const authorCount = _.countBy(blogs, 'author')
  const [author, blogsCount] = _.maxBy(_.entries(authorCount), ([, count]) => count)

  return { author, blogs: blogsCount }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return { author: null, likes: 0 }

  /* Using native JS, no external libraries */
  // const authorLikes = blogs.reduce((acc, { author, likes }) => {
  //   acc[author] = (acc[author] || 0) + likes
  //   return acc
  // }, {})

  // const { author, likes } = Object.entries(authorLikes)
  //   .reduce((acc, [ author, likes ]) =>
  //     acc.likes > likes ? acc : { author, likes }
  //   , { author: null, likes: 0 })

  /* Using lodash */
  const authorLikes = _.mapValues(_.groupBy(blogs, 'author'), (author) =>
    _.sumBy(author, 'likes')
  )

  const [ author, likes ] = _.maxBy(_.entries(authorLikes), ([,value]) => value)

  return { author, likes }

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}