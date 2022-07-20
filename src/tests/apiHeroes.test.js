const assert = require('assert');
const api = require('../../api');
let app = {};
let MOCK_ID = '';
let MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1bmxpZ2h0IiwiaWQiOjgsImlhdCI6MTY1NjA4MzgxNH0.oLagGZ4ibDuCOOQDLLkff8gS-KbVA4qiTpMKEgopFBs';

const headers = {
  Authorization: MOCK_TOKEN
}

const MOCK_HERO = {
  name: 'Batman',
  power: 'Money'
};

const MOCK_STARTER_HERO = {
  name: 'Spider-man',
  power: 'Net'
};


function onUncaught(err){
  console.log(err);
  process.exit(1);
}

process.on('unhandledRejection', onUncaught);

describe('Tests suite for Heroes API', function () {
  this.beforeAll(async () => {
    app = await api;
    const { payload } = await app.inject({
      method: 'POST',
      url: '/heroes',
      headers,
      payload: JSON.stringify(MOCK_STARTER_HERO)
    });
    const { _id } = JSON.parse(payload);
    MOCK_ID = _id;
  });

  it('GET - Should list heroes on route /heroes', async () => {
    const { statusCode, payload } = await app.inject({
      method: 'GET',
      headers,
      url: '/heroes'
    })

    const data = JSON.parse(payload);

    assert.deepEqual(statusCode, 200);
    assert.ok(Array.isArray(data));
  });

  it('GET - Route /heroes should return just 10 registers', async function () {
    const LIMIT = 10;
    const { statusCode, payload } = await app.inject({
      method: 'GET',
      headers,
      url: `/heroes?skip=0&limit=${LIMIT}`
    });

    const data = JSON.parse(payload);

    assert.deepEqual(statusCode, 200);
    assert.ok(data.length <= LIMIT);
  });

  it('GET - Should return error 400 if limit is invalid', async () => {
    const LIMIT = 'AAEEW';
    const { statusCode } = await app.inject({
      method: 'GET',
      headers,
      url: `/heroes?skip=0&limit=${LIMIT}`
    });

    assert.deepEqual(statusCode, 400);
  });

  it('GET - Should return just one hero', async () => {
    const NAME = MOCK_STARTER_HERO.name;
    const { statusCode, payload } = await app.inject({
      method: 'GET',
      headers,
      url: `/heroes?skip=0&limit=10&name=${NAME}`
    });

    const [hero] = JSON.parse(payload);
    assert.deepEqual(statusCode, 200);
    //assert.deepEqual(hero.name, NAME);
    assert.deepEqual(hero.name, NAME);
  });

  it('POST - Register hero on route /heroes', async () => {
    const { statusCode, payload } = await app.inject({
      method: 'POST',
      headers,
      url: `/heroes`,
      payload: MOCK_HERO
    });

    const { message, _id } = JSON.parse(payload);

    assert.ok(statusCode === 200);
    assert.notStrictEqual(_id, undefined)
    assert.deepEqual(message, "Hero registered with success");
  });

  it('PATCH - Update hero on route /heroes/:id', async () => {
    const _id = MOCK_ID;
    const expected = {
      power: 'Super Net'
    }
    const { statusCode, payload } = await app.inject({
      method: 'PATCH',
      url: `/heroes/${_id}`,
      headers,
      payload: JSON.stringify(expected)
    });

    const data = JSON.parse(payload);

    assert.ok(statusCode === 200);
    assert.deepEqual(data.message, 'Hero updated with success!');
  });

  it('PATCH - /heroes/:id should not update if invalid id', async () => {
    const _id = '62b09bad7f9bf4bf3f4343ff';
    const expected = {
      power: 'Super Net'
    }
    const { statusCode, payload } = await app.inject({
      method: 'PATCH',
      url: `/heroes/${_id}`,
      headers,
      payload: JSON.stringify(expected)
    });

    const data = JSON.parse(payload);
    const expectedData = {
      statusCode: 412,
      error: 'Precondition Failed',
      message: 'Hero not found on database'
    }

    assert.ok(statusCode === 412);
    assert.deepEqual(data, expectedData);
  });

  it('DELETE - Should delete hero by id on route /heroes/:id', async () => {
    const _id = MOCK_ID;
    const { statusCode, payload } = await app.inject({
      method: 'DELETE',
      headers,
      url: `/heroes/${_id}`,
    });

    const { message } = JSON.parse(payload);

    assert.ok(statusCode === 200);
    assert.deepEqual(message, 'Hero deleted with success!');

  });

  it('DELETE - /heroes/:id should return invalid if id doesn\'t exist', async () => {
    const _id = '62b09bad7f9bf4bf3f4343ff';
    const { statusCode, payload } = await app.inject({
      method: 'DELETE',
      headers,
      url: `/heroes/${_id}`,
    });

    const data = JSON.parse(payload);

    const expected = {
      statusCode: 412,
      error: 'Precondition Failed',
      message: 'Hero not found on database'
    };

    assert.ok(statusCode === 412);
    assert.deepEqual(data, expected);
  });

  it('DELETE - /heroes/:id has invalid id', async () => {
    const _id = 'INVALID_ID';
    const { statusCode, payload } = await app.inject({
      method: 'DELETE',
      headers,
      url: `/heroes/${_id}`,
    });

    const data = JSON.parse(payload);

    const expected = {
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An internal server error occurred'
    };

    assert.ok(statusCode === 500);
    assert.deepEqual(data, expected);
  });
});
