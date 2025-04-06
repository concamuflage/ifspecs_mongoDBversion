require('dotenv').config();
const { MongoClient } = require('mongodb');

const username = process.env.DB_USER;
const password = process.env.DB_PASS;
const uri = `mongodb+srv://${username}:${password}@cluster0.cnslt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);
let isConnected = false;

async function connectDB() {
  try {
    if (isConnected) {
      return client.db('ifspecs'); 
    }
    
    await client.connect();
    console.log("Connected to MongoDB");
    isConnected = true;

    return client.db('ifspecs'); 
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

module.exports = connectDB;
