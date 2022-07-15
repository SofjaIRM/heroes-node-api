const BaseRoute = require('./base/baseRoute');
const Joi = require('joi');
const Boom = require('@hapi/boom');
const PasswordHelper = require('./../helpers/passwordHelper');
const Jwt = require('jsonwebtoken');

const failAction = (request, headers, error) => {
  throw error;
};

class AuthRoutes extends BaseRoute {
  constructor(secret, db) {
    super();
    this.secret = secret;
    this.db = db;
  }
  login() {
    return {
      path: '/login',
      method: 'POST',
      config: {
        auth: false, // authentication route should not use the auth, so it could not be able to generate the token
        tags: ['api'],
        description: 'Get token',
        notes: 'Login using username and password from database',
        validate: {
          failAction,
          payload: {
            username: Joi.string().required(),
            password: Joi.string().required()
          }
        }
      },
      handler: async (request, headers) => {
        const { username, password } = request.payload;

        const [user] = await this.db.read({
          username: username.toLowerCase()
        });

        if(!user) return Boom.unauthorized('User does not exist!');

        const match = await PasswordHelper.comparePassword(password, user.password);

        if(!match) return Boom.unauthorized('Invalid user or password!');

        return {
          token : Jwt.sign({
            username: user.username.toLowerCase(),
            id: user.id
          }, this.secret)
        }
      }
    }
  }
}

module.exports = AuthRoutes;
