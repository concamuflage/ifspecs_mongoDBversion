const connectDB = require("../database_connect");

async function getProductsByName(nameQuery) {
  const db = await connectDB();
  const products = await db.collection('products').aggregate([
    {
      $match: {
        name: { $regex: nameQuery, $options: "i" }
      }
    },

    /* 
    the following lookup stage add a new attribute brandInfo like the following one.
    {
          name: "iPhone 15",
          brand: ObjectId("..."),
          brandInfo: [
            {
              _id: ObjectId("..."),
              name: "Apple"
            }
          ]
        } */
    {
      $lookup: {
        from: "brands",
        localField: "brand",  // from the perspective the products collection.
        foreignField: "_id", //Find documents in brands where _id === product.brand
        as: "brandInfo" // the resulting document will be stored in this field in the product doc
      }
    },
    {
      $unwind: "$brandInfo"
    },
    {
      $addFields: {
        brand: "$brandInfo.name"
      }
    },
    {
      $project: {
        brandInfo: 0
      }
    }
  ]).toArray();
  return products;
}

(async () => {
  const products = await getProductsByName("ipad"); // example query
  console.log(products);
})();