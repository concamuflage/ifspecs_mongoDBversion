require('dotenv').config();
const { MongoClient } = require('mongodb');

const username = process.env.AWS_DB_USER;
const password = process.env.AWS_DB_PASS;
const uri = `mongodb://${username}:${password}@ec2-54-200-9-245.us-west-2.compute.amazonaws.com:27017/admin?directConnection=true&authSource=admin`;

const client = new MongoClient(uri);
let isConnected = false;

async function aws_connectDB() {
  try {
    if (isConnected) {
      return client.db('ifspecs'); 
    }
    
    await client.connect();
    console.log("Connected to AWS MongoDB service");
    isConnected = true;

    return client.db('ifspecs'); 
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

module.exports = aws_connectDB;

aws_connectDB()
