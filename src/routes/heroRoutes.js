const BaseRoute = require('./base/baseRoute');
const Joi = require('joi');
const Boom = require('@hapi/boom');

const failAction = (request, headers, error) => {
  throw error;
};

const headers = Joi.object({
  authorization: Joi.string().required()
}).unknown();

class HeroRoutes extends BaseRoute {
  constructor(db) {
    super();
    this.db = db;
  }

  list() {
    return {
      path: '/heroes',
      method: 'GET',
      config: {
        tags:['api'],
        description: 'Should list heroes',
        notes: 'Can paginate data and filter by name',
        validate: {
          failAction,
          query: {
            skip: Joi.number().integer().default(0),
            limit: Joi.number().integer().default(10),
            name: Joi.string().min(3).max(100)
          },
          headers,
        }
      },
      handler: (request) => {
          try {
            const { skip, limit, name } = request.query;

            const query = {
              name: {
                $regex: `.*${name}*.`
              }
            }

            return this.db.read(name ? query : {}, skip, limit);
          } catch(error) {
            console.log('Error', error);
            return Boom.internal();
          }
      }
    }
  }

  create() {
    return {
      path: '/heroes',
      method: 'POST',
      config: {
        tags:['api'],
        description: 'Should register an heroes',
        notes: 'Should register hero by name and power',
        validate: {
          failAction,
          headers,
          payload: Joi.object({
            name: Joi.string().required().min(3).max(100),
            power: Joi.string().required().min(2).max(100),
          }).label('Add hero')
        }
      },
      handler: async (request) => {
        try {
          const { name, power } = request.payload;
          const { _id } = await this.db.create({ name, power});
          return {
            _id,
            message: 'Hero registered with success'
          }
        } catch (error) {
          console.log('Error', error);
          return Boom.internal();
        }
      }
    }
  }

  update() {
    return {
      path: '/heroes/{id}',
      method: 'PATCH',
      config: {
        tags:['api'],
        description: 'Should update an hero',
        notes: 'Should update hero by id',
        validate: {
          params: {
            id: Joi.string().required()
          },
          headers,
          payload: Joi.object({
            name: Joi.string().min(3).max(100),
            power: Joi.string().min(3).max(100)
          }).label('Update hero')
        }
      },
      handler: async (request) => {
        try {
          const {
            params: { id },
            payload
          } = request

          const dataString = JSON.stringify(payload);
          const data = JSON.parse(dataString);
          const { matchedCount } = await this.db.update(id, data);

          if (matchedCount !== 1) {
            return Boom.preconditionFailed('Hero not found on database');
          }

          return {
            message: 'Hero updated with success!'
          }
        } catch (error) {
          console.error('Error', error);
          return Boom.internal();
        }
      }
    }
  }

  delete() {
    return {
      path: '/heroes/{id}',
      method: 'DELETE',
      config: {
        tags:['api'],
        description: 'Should delete an hero',
        notes: 'Should delete hero based on id',
        validate: {
          params: {
            id: Joi.string().required()
          },
          headers,
        }
      },
      handler: async (request) => {
        try {
          const { id } = request.params;

          const { deletedCount } = await this.db.delete(id);

          if ( deletedCount !== 1) {
            return Boom.preconditionFailed('Hero not found on database');
          }

          return {
            message: 'Hero deleted with success!'
          }
        } catch(error) {
          return Boom.internal();
        }
      }
    }
  }
}

module.exports = HeroRoutes;
