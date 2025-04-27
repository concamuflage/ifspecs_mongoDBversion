const connectDB = require("../database_connect");

async function getProductsByBrand(brandName) {
  const db = await connectDB();
  const products = await db.collection('products_not_normalized').find({ brand: brandName }).toArray();
  return products;
}

(async () => {
    const products = await getProductsByBrand("Apple");
    console.log(products);
  })();