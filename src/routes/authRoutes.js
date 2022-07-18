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
      path: '/auth/login',
      method: 'POST',
      config: {
        auth: false, // authentication route should not use the auth, so it could not be able to generate the token
        tags: ['api'],
        description: 'Get token',
        notes: 'Login using username and password from database',
        validate: {
          failAction,
          payload: Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
          }).label('Login')
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

  signup() {
    return {
      path: '/auth/signup',
      method: 'POST',
      options: {
        auth: false,
        tags: ['api'],
        description: 'Register new user',
        notes: 'Register user on database',
        validate: {
          failAction,
          payload: Joi.object({
            username: Joi.string().required().min(5),
            password: Joi.string().required().label('password').min(8),
          }).label('Sign Up')
        },
      },
      handler: async (request) => {
        try {
          const { username, password } = request.payload;

          const [user] = await this.db.read({
            username: username.toLowerCase()
          });

          if(user) return Boom.unauthorized('User already exists!');

          const hashPassword = await PasswordHelper.hashPassword(password);

          const { dataValues: { id } } = await this.db.create({
            username: username.toLowerCase(),
            password: hashPassword,
          });

          return {
            message: 'User registered with success'
          };
        } catch (error) {
          console.error('Error', error);
          return Boom.internal();
        }
      }
    }
  }
}

module.exports = AuthRoutes;
