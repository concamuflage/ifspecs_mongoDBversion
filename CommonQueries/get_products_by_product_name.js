const connectDB = require("../database_connect");

async function getProductsByName(nameQuery) {
  const db = await connectDB();
  const products = await db.collection('products').find({
    // match the string in any place, case insensitive.
    name: { $regex: nameQuery, $options: "i" } 
  }).toArray();
  return products;
}

(async () => {
  const products = await getProductsByName("ipad"); // example query
  console.log(products);
})();