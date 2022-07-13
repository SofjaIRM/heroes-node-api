const assert = require('assert');
const Postgres = require('./../db/strategies/postgres/postgres');
const Context = require('./../db/strategies/base/contextStrategy');
const HeroesSchema = require('./../db/strategies/postgres/schemas/heroesSchema');

const MOCK_HERO = {
  name: 'Hawkman',
  power: 'Arrows'
}
const MOCH_HERO_UPDATE = {
  name: 'Batman',
  power: 'Money'
}

let context = {};

describe('Postgres Strategy', function () {
  this.timeout(Infinity);
  this.beforeAll(async function () {
    const connection = await Postgres.connect();
    const model = await Postgres.defineModel(connection, HeroesSchema);
    context = new Context(new Postgres(connection, model));
    await context.delete();
    await context.create(MOCH_HERO_UPDATE)
  })

  it('Should connect to PostgresSQL', async function () {
    const result = await context.isConnected();
    assert.equal(result, true);
  });

  it('Should register a new hero', async function() {
    const result = await context.create(MOCK_HERO);
    delete result.dataValues.id;
    assert.deepEqual(result.dataValues, MOCK_HERO);
  });

  it('Should list all heroes', async function () {
    const [result] = await context.read({ name: MOCK_HERO.name });
    delete result.id;
    assert.deepEqual(result, MOCK_HERO);
  });

  it('Should update an hero', async function() {
    const [heroToUpdate] = await context.read({ name: MOCH_HERO_UPDATE.name });
    const newHeroName = { ...MOCH_HERO_UPDATE, name: 'Wonder Woman' };

    const [heroUpdatedCount] = await context.update(heroToUpdate.id, newHeroName);

    assert.deepEqual(heroUpdatedCount, 1);
  });

  it('Should remove hero by id', async function() {
    const [hero] = await context.read({});
    const deletedItem = await context.delete(hero.id);
    assert.deepEqual(deletedItem, 1);
  });
});
