const connectDB = require("../database_connect");

async function getProductsByYear(year) {
  const db = await connectDB();
  const products = await db.collection('products').find({ launch_year: year }).toArray();
  return products;
}

(async () => {
  const products = await getProductsByYear(2025); // example year
  console.log(products);
})();