const assert = require('assert');
const api = require('../../api');
const Context = require('./../db/strategies/base/contextStrategy');
const PostgresDB = require('./../db/strategies/postgres/postgres');
const UserSchema = require('./../db/strategies/postgres/schemas/userSchema');

let app = {};
const USER = {
  username: 'sunlight',
  password: '12399999'
}

describe.only('Auth test suite', function () {
  this.beforeAll(async () => {
    app = await api;
    const connectionPostgres = await PostgresDB.connect();
    const model = await PostgresDB.defineModel(connectionPostgres, UserSchema);
    const postgresModel = new Context(new PostgresDB(connectionPostgres, model));
    const [user] = await postgresModel.read({username: USER.username});
    if (user) {
      await postgresModel.delete(user.id);
    }
  });

  it('should register a new user', async () => {
    const { statusCode, payload } = await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: USER,
    });

    assert.deepEqual(statusCode, 200);
    assert.deepEqual(JSON.parse(payload).message, 'User registered with success')
  });

  it('should not register if user already exists', async () => {
    const { statusCode, payload } = await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: USER,
    });

    assert.deepEqual(statusCode, 401);
    assert.deepEqual(JSON.parse(payload).error, 'Unauthorized')
  });

  it('should return error 400 if username has less then 5 characters', async () => {
    const { statusCode, payload } = await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: {
        username: 'sun',
        password: USER.password
      }
    });

    assert.deepEqual(statusCode, 400);
    assert.deepEqual(JSON.parse(payload).error, 'Bad Request');
  });

  it('should return error 400 if password has less then 8 characters', async () => {
    const { statusCode, payload } = await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: {
        username: USER.username,
        password: '993'
      }
    });

    assert.deepEqual(statusCode, 400);
    assert.deepEqual(JSON.parse(payload).error, 'Bad Request');
  });

  it('should get a token', async () => {
    const { statusCode, payload } = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: USER,
    });

    const token = JSON.parse(payload).token;

    assert.deepEqual(statusCode, 200);
    assert.ok(token.length > 10);
  });

  it('should return not authorized if login returns an error', async () => {
    const { statusCode, payload } = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'skylight',
        password: '123323'
      }
    });

    assert.deepEqual(statusCode, 401);
    assert.deepEqual(JSON.parse(payload).error, "Unauthorized");
  });
});
