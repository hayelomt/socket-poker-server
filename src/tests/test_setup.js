import mongoose from 'mongoose';

const dbName = process.env.DB_NAME || 'poker_testing';

before(async () => {
  console.log('==>Connect DB');
  await mongoose.connect(`mongodb://localhost/${process.env.DB_NAME}`, {});
});

after(async () => {
  console.log('==>Close DB');
  await mongoose.connection.close();
});
