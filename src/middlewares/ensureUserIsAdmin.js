const knex = require('../database/knex')
const AppError = require('../utils/AppError')

async function ensureUserIsAdmin(request, response, next) {
  try {
    const user_id = request.user.id

    const user = await knex("users").where({ id: user_id }).first()

    if (!user || !user.isAdmin) {
      throw new AppError("Access Denied: Unauthorized User", 401)
    }

    next()
  } catch (error) {
    next(error)
  }
}

module.exports = ensureUserIsAdmin