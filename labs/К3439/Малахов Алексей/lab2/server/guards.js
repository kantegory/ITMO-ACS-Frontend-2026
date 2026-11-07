const UNIQUE = {
  likes: ['recipeId', 'userId'],
  saved: ['recipeId', 'userId'],
  follows: ['authorId', 'userId'],
}

module.exports = (req, res, next) => {
  const parts = req.path.split('/').filter(Boolean)
  if (/^\d{3}$/.test(parts[0])) parts.shift()
  const [resource] = parts
  const keys = UNIQUE[resource]

  if (req.method === 'PUT') {
    res.status(405).jsonp('Use PATCH instead of PUT')
    return
  }

  if (req.method === 'PATCH' && (keys || (req.body && 'userId' in req.body))) {
    res.status(403).jsonp('Owner cannot be changed')
    return
  }

  if (req.method === 'POST' && keys && req.app.db) {
    const collection = req.app.db.get(resource)
    const exists = collection
      .some((item) => keys.every((key) => String(item[key]) === String(req.body[key])))
      .value()
    if (exists) {
      res.status(409).jsonp('Already exists')
      return
    }
    const item = collection.insert(req.body).value()
    req.app.db.write()
    res.status(201).jsonp(item)
    return
  }

  next()
}
