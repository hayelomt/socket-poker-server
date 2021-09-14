import mongoose from 'mongoose';
import db from './db';

const dbName = process.env.DB_NAME || 'poker_testing';

before(async () => {
  // console.log('==>Connect DB');
  await db.connectTestDb();
  // await mongoose.connect(`mongodb://localhost/${process.env.DB_NAME}`, {
  //   // autoIndex:
  // });
});

after(async () => {
  // console.log('==>Close DB');
  await db.closeDatabase();
  // await mongoose.connection.close();
});
