const connectDB = require("../database_connect");

async function getProductsByBrand(brandName) {
  const db = await connectDB();

  const brand = await db.collection('brands').findOne({ name: brandName });
  if (!brand) {
    console.log(`Brand "${brandName}" not found.`);
    return [];
  }

  const products = await db.collection('products').aggregate([
    { $match: { brand: brand._id } },
    {
      $addFields: {
        brand: brand.name  // replace ObjectId with brand name
      }
    }
  ]).toArray();
  

  return products;
}

(async () => {
    const products = await getProductsByBrand("Apple");
    console.log(products);
  })();