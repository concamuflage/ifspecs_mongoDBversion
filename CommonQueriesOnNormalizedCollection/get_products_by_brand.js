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
      $lookup: {
        from: "chipsets",
        let: { chipsetId: { 
          $arrayElemAt: [
            {
              $map: {
                input: {
                  $filter: {
                    input: "$quickSpec",
                    as: "spec",
                    cond: { $eq: ["$$spec.name", "Chipset"] }
                  }
                },
                as: "filteredSpec",
                in: "$$filteredSpec.value"
              }
            },
            0
          ]
        }},
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$chipsetId"] } } },
          { $project: { _id: 0, name: 1 } }
        ],
        as: "chipsetInfo"
      }
    },
    {
      $set: {
        quickSpec: {
          $map: {
            input: "$quickSpec",
            as: "spec",
            in: {
              $cond: [
                { $eq: ["$$spec.name", "Chipset"] },
                {
                  $mergeObjects: [
                    "$$spec",
                    { value: { $arrayElemAt: ["$chipsetInfo.name", 0] } }
                  ]
                },
                "$$spec"
              ]
            }
          }
        }
      }
    },
    { $unset: "chipsetInfo" }
  ]).toArray();

  return products;
}

(async () => {
    const products = await getProductsByBrand("Apple");
    console.log(products);
})();