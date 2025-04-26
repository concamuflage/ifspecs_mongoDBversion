require('dotenv').config();
const { MongoClient } = require('mongodb');

const username = process.env.GCLOUD_DB_USER;
const password = process.env.GCLOUD_DB_PASS;
const uri = `mongodb://${username}:${password}@first-workload-balancer-5d69eb87e6158a86.elb.us-west-2.amazonaws.com:27017/ifspecs?directConnection=true`;

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

// aws_connectDB()
