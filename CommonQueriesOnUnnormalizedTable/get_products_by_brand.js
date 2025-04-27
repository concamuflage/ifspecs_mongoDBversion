const connectDB = require("../database_connect");

async function getProductsByBrand(db,brandName) {
  const products = await db.collection('products_not_normalized').find({ brand: brandName }).toArray();
  return products;
}
module.exports = getProductsByBrand;

// (async () => {
//     const products = await getProductsByBrand("Apple");
//     console.log(products);
//   })();