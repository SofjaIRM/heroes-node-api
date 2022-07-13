const assert = require('assert');
const MongoDb = require('./../db/strategies/mongodb/mongodb');
const HeroesSchema = require('./../db/strategies/mongodb/schemas/heroesSchema');
const Context = require('./../db/strategies/base/contextStrategy');

let context = new Context(new MongoDb());

const MOCK_HERO = {
  name: 'Flash',
  power: 'speed'
}

const MOCK_HERO_DEFAULT = {
  name: `Batman-${Date.now()}`,
  power: 'money'
}

const MOCK_HERO_UPDATE = {
  name: `SpiderMan-${Date.now()}`,
  power: 'Web'
}

let MOCK_HERO_ID = '';

describe('MongoDB strategy', function () {
  this.beforeAll(async () => {
    const connection = MongoDb.connect();
    context = new Context(new MongoDb(connection, HeroesSchema));
    await context.create(MOCK_HERO_DEFAULT);
    const hero = await context.create(MOCK_HERO_UPDATE);
    MOCK_HERO_ID = hero._id;
  })
  it('Should check connection', async () => {
    const result = await context.isConnected();
    const expected = 'Connected';

    assert.deepEqual(result, expected);
  })
  it('Should create a new hero', async () => {
    const { name, power } = await context.create(MOCK_HERO);

    assert.deepEqual({ name, power }, MOCK_HERO);
  })
  it('Should list all heroes', async () => {
    const [{ name, power }] = await context.read({ name: MOCK_HERO_DEFAULT.name });
    const result = {name, power};
    assert.deepEqual(result, MOCK_HERO_DEFAULT);
  })
  it('Should update', async () => {
    const result = await context.update(MOCK_HERO_ID, {
      name: 'Black Widow'
    });
    assert.deepEqual(result.modifiedCount, 1)
  })
  it('Should delete an hero', async () => {
    const result = await context.delete(MOCK_HERO_ID);
    assert.deepEqual(result.deletedCount, 1);
  })
})
