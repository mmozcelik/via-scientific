import { MongoMemoryServer } from 'mongodb-memory-server';

const mongoose = require('mongoose');

let mongod = null;
export async function dbConnect() {
  mongod = await MongoMemoryServer.create();
  const uri = await mongod.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };

  await mongoose.connect(uri, mongooseOpts);
}

export async function dbDisconnect() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}
