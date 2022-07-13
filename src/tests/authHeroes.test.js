const assert = require('assert');
const api = require('../../api');
const Context = require('./../db/strategies/base/contextStrategy');
const PostgresDB = require('./../db/strategies/postgres/postgres');
const UserSchema = require('./../db/strategies/postgres/schemas/userSchema');

let app = {};
const USER = {
  username: 'sunlight',
  password: '123'
}

const USER_DB = {
  username: USER.username.toLowerCase(),
  password: '$2b$04$W0sV8jIXA0LLZwXCxslp3.9B9miqxijiieHVrI4vUzOgPlSgNo3Nu'
};

describe('Auth test suite', function () {
  this.beforeAll(async () => {
    app = await api;

    const connectionPostgres = await PostgresDB.connect();
    const model = await PostgresDB.defineModel(connectionPostgres, UserSchema);
    const postgresModel = new Context(new PostgresDB(connectionPostgres, model));
    await postgresModel.update(null, USER_DB, true);
  });

  it('should get a token', async () => {
    const { statusCode, payload } = await app.inject({
      method: 'POST',
      url: '/login',
      payload: USER,
    });

    const token = JSON.parse(payload).token;

    assert.deepEqual(statusCode, 200);
    assert.ok(token.length > 10);
  });

  it('should return not authorized if login returns an error', async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'skylight',
        password: '123323'
      }
    });

    const statusCode = result.statusCode;

    assert.deepEqual(statusCode, 401);
    assert.deepEqual(JSON.parse(result.payload).error, "Unauthorized");
  });
});
