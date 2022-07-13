const ICrud = require('./../interfaces/interfaceCrud');
const Mongoose = require('mongoose');
const STATUS = {
  0: 'Disconnected',
  1: 'Connected',
  2: 'Connecting',
  3: 'Disconnecting',
  4: 'Invalid Credentials'
}

class MongoDB extends ICrud {
  constructor(connection, schema) {
    super();
    this._schema = schema;
    this._connection = connection;
  }
  async isConnected() {
    const state = STATUS[this._connection.readyState]
    if (state === 'Connected') return state;
    if (state !== 'Connecting') return state;
    await new Promise(resolve => setTimeout(resolve, 1000));
    return STATUS[this._connection.readyState];
  }

  static connect() {
    try {
      Mongoose.connect(process.env.MONGO_DB_URL);
      const connection = Mongoose.connection;
      connection.once('open', () => console.log('Database is running!!'));
      return connection;
    } catch (error) {
      console.warn('Connection Failed', error);
    }
  };

  create(item) {
      return this._schema.create(item);
  }

  read(item, skip= 0, limit= 10) {
    return this._schema.find(item).skip(skip).limit(limit);
  }

  update(id, item) {
    return this._schema.updateOne({ _id: id }, { $set: item })
  }

  delete(id) {
    return this._schema.deleteOne({ _id: id });
  }
}

module.exports = MongoDB;
