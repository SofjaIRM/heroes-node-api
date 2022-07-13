const { config } = require('dotenv');
const { join } = require('path');
const { ok } = require('assert');
const Hapi = require('@hapi/hapi');
const HapiSwagger = require('hapi-swagger');
const HapiJwt = require('hapi-auth-jwt2');
const Vision = require('@hapi/vision');
const Inert = require('@hapi/inert');
const Joi = require('joi');

const Context = require('./src/db/strategies/base/contextStrategy');
const MongoDb = require('./src/db/strategies/mongodb/mongodb');
const HeroesSchema = require('./src/db/strategies/mongodb/schemas/heroesSchema');
const HeroRoute = require('./src/routes/heroRoutes');
const AuthRoute = require('./src/routes/authRoutes');
const UtilRoute = require('./src/routes/utilRoutes');
const Postgres = require('./src/db/strategies/postgres/postgres');
const UserSchema = require('./src/db/strategies/postgres/schemas/userSchema');

const env = process.env.NODE_ENV || "dev";

ok(env === 'prod' || env == 'dev', 'env is invalid');

const configPath = join(__dirname, './config', `.env.${env}`);

config({
  path: configPath
});


const JWT_SECRET = process.env.JWT_KEY;

const app = new Hapi.Server({ port: process.env.PORT });

function mapRoutes(instance, methods) {
  return methods.map((method) => instance[method]());
};

async function main() {
  const connection = MongoDb.connect();
  const context = new Context(new MongoDb(connection, HeroesSchema));

  const connectionPostgres = await Postgres.connect();
  const model = await Postgres.defineModel(connectionPostgres, UserSchema);
  const contextPostgres = new Context(new Postgres(connectionPostgres, model));

  const swaggerOptions = {
    info: {
      title: 'API Heroes - #CursoNodeBR',
      version: 'v1.0'
    },
  }

  await app.register([
    HapiJwt,
    Vision,
    Inert,
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    }
  ]);

  app.auth.strategy('jwt', 'jwt', {
    key: JWT_SECRET,
    //options: {
    //  expiresIn: 20
    //}
    validate: (data, request) => {
      const result = contextPostgres.read({
        username: data.username.toLowerCase(),
        id: data.id
      });

      if(!result) {
        return {
          isValid:false
        }
      }
      return {
        isValid: true
      }
    }
  });

  app.auth.default('jwt');

  app.validator(Joi);

  app.route([
    ...mapRoutes(new HeroRoute(context), HeroRoute.methods()),
    ...mapRoutes(new AuthRoute(JWT_SECRET, contextPostgres), AuthRoute.methods()),
    ...mapRoutes(new UtilRoute(), UtilRoute.methods()),
  ]);

  await app.start();

  console.log('Server is running on port', app.info.port);

  return app;
}

module.exports = main();
