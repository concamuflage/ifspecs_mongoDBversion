// anotherFile.js
const connectDB = require('../database_connect');

async function getData() {
  const db = await connectDB();
  const products = await db.collection('products').find().toArray();
  console.log(products);
}

getData();