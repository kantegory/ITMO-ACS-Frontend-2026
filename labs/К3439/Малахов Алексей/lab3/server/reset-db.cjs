const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const { users, PASSWORD, recipes, comments, likes, follows } = require('./seed-data.cjs')

const hash = bcrypt.hashSync(PASSWORD, '$2a$10$recipesdemosaltrecipeu')

const db = {
  users: users.map(({ id, email, name }) => ({ id, email, password: hash, name })),
  profiles: users.map(({ id, name, username, city, bio }) => ({ id, userId: id, name, username, city, bio })),
  recipes: recipes.map((recipe) => ({ ...recipe, createdAt: '2026-10-01T12:00:00.000Z' })),
  comments: comments.map((comment, index) => ({ id: index + 1, ...comment })),
  likes: likes.flatMap(([recipeId, userIds]) => userIds.map((userId) => ({ recipeId, userId }))).map((like, index) => ({ id: index + 1, ...like })),
  saved: [],
  follows: follows.map(([userId, authorId], index) => ({ id: index + 1, userId, authorId })),
}

fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2) + '\n')
console.log('db.json пересоздан')
