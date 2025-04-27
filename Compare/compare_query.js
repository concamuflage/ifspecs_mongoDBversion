const get_products_by_brand_unnormalized = require("../CommonQueriesOnUnnormalizedTable/get_products_by_brand.js");
const get_products_by_brand_normalized = require("../CommonQueriesOnNormalizedCollection/get_products_by_brand.js");
const addIndexes = require("../AddIndices/add_index.js");
const connectDB = require("../database_connect");

const brand = "Samsung";



async function main() {

  const db = await connectDB();
  console.log("Connected to MongoDB");

  // Drop all the indexes
  console.log("Dropping all indexes...");
  await db.collection('products').dropIndexes();
  console.log("Indexes dropped.");

  // Measure normalized query without indexes
  const startNormalizedWithoutIndex = Date.now();
  await get_products_by_brand_normalized(db,brand);
  const normalizedDurationWithoutIndex = Date.now() - startNormalizedWithoutIndex;
  console.log(`Normalized query duration WITHOUT index: ${normalizedDurationWithoutIndex}ms`);

  // Add indexes
  console.log("Adding indexes...");
  await addIndexes(db);
  console.log("Indexes created successfully.");

  // Measure normalized query with indexes
  const startNormalizedWithIndex = Date.now();
  await get_products_by_brand_normalized(db,brand);
  const normalizedDurationWithIndex = Date.now() - startNormalizedWithIndex;
  console.log(`Normalized query duration WITH index: ${normalizedDurationWithIndex}ms`);

  // Measure unnormalized query
  const startUnnormalized = Date.now();
  await get_products_by_brand_unnormalized(db,brand);
  const unnormalizedDuration = Date.now() - startUnnormalized;
  console.log(`Unnormalized query duration: ${unnormalizedDuration}ms`);

  process.exit(0); // Only exit AFTER all work is done
}

main().catch(err => {
  console.error("Error during execution:", err);
  process.exit(1);
});
