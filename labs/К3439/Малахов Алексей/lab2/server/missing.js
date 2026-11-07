module.exports = (req, res, next) => {
  const parts = req.path.split('/').filter(Boolean)
  if (/^\d{3}$/.test(parts[0])) parts.shift()
  const [resource, id] = parts

  if (['PATCH', 'DELETE'].includes(req.method) && id && req.app.db && req.app.db.has(resource).value()) {
    if (!req.app.db.get(resource).getById(id).value()) {
      res.status(404).jsonp('Not found')
      return
    }
  }

  next()
}
