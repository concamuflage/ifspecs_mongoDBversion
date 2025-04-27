require("dotenv").config();
const { MongoClient } = require("mongodb");

const username = process.env.GCLOUD_DB_USER;
const password = process.env.GCLOUD_DB_PASS;
const uri = `mongodb://${username}:${password}@35.215.15.247:27017/admin?directConnection=true&authSource=admin`;

const client = new MongoClient(uri);
let isConnected = false;

async function connectDB() {
  try {
    if (isConnected) {
      return client.db("ifspecs");
    }

    await client.connect();
    console.log("Connected to MongoDB");
    isConnected = true;

    return client.db("ifspecs");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

module.exports = connectDB;

connectDB();
