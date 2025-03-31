require('dotenv').config();
const { MongoClient } = require('mongodb');

const username = encodeURIComponent(process.env.DB_USER);
const password = encodeURIComponent(process.env.DB_PASS);
const uri = `mongodb+srv://${username}:${password}@cluster0.cnslt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);

// 👇 Change 'yourDatabaseName' to your actual DB name
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // 👇 Return the database instance
    return client.db('ifspecs'); // ← replace with your actual database name
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

module.exports = connectDB;