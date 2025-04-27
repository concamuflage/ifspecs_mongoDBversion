const connectDB = require("../database_connect");

async function getProductsByBrand(db,brandName) {
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
        // stores the a doc's Chipset value in chipsetID
        let: { chipsetId: { // defines a variable chipsetId to be used later.
          $arrayElemAt: [ // return array[0], array is produced by map.
            {
              // result of map is an array, expected result example ["Apple A16 Bionic"]
              $map: {
                input: {
                  $filter: {
                    // filter only element whose name is Chipset.
                    input: "$quickSpec",
                    as: "spec",
                    cond: { $eq: ["$$spec.name", "Chipset"] }
                  }
                },
                as: "filteredSpec",
                in: "$$filteredSpec.value" // what to do with each input? take its value only
              }
            },
            0
          ]
        }},
        // finds its corresponding string in the chipset collection
        pipeline: [
          // "$$chipsetId" from let clause, "$_id" an attribute from doc in chipsets
          { $match: { $expr: { $eq: ["$_id", "$$chipsetId"] } } },
          // if a doc's _id matches $$chipsetId,return only the name field.
          { $project: { _id: 0, name: 1 } }
        ],
        // stores this info the following attribute
        as: "chipsetInfo"
      }
    },
      // Lookup for RAM size
    {
      $lookup: {
        from: "ram_sizes",
        let: {
          ramId: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: "$quickSpec",
                      as: "spec",
                      cond: { $eq: ["$$spec.name", "RAM size"] }
                    }
                  },
                  as: "filteredSpec",
                  in: "$$filteredSpec.value"
                }
              },
              0
            ]
          }
        },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$ramId"] } } },
          { $project: { _id: 0, name: 1 } }
        ],
        as: "ramInfo"
      }
    },
      // Lookup for Display size
    {
      $lookup: {
        from: "display_sizes",
        let: {
          displaySizeId: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: "$quickSpec",
                      as: "spec",
                      cond: { $eq: ["$$spec.name", "Display size"] }
                    }
                  },
                  as: "filteredSpec",
                  in: "$$filteredSpec.value"
                }
              },
              0
            ]
          }
        },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$displaySizeId"] } } },
          { $project: { _id: 0, name: 1 } }
        ],
        as: "displaySizeInfo"
      }
    },
      // Lookup for Display Resolutions
    {
      $lookup: {
        from: "display_resolutions",
        let: {
          displayResolutionId: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: "$quickSpec",
                      as: "spec",
                      cond: { $eq: ["$$spec.name", "Display resolution"] }
                    }
                  },
                  as: "filteredSpec",
                  in: "$$filteredSpec.value"
                }
              },
              0
            ]
          }
        },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$displayResolutionId"] } } },
          { $project: { _id: 0, name: 1 } }
        ],
        as: "displayResolutionInfo"
      }
    },
    // replacing the ids with the string
    {
      $set: {
        // set quickSpec to the following new value.
        quickSpec: {
          // use map to construct the new value
          $map: {
            input: "$quickSpec", // take this array
            as: "spec", // treat each array element as spec
            in: { // what to do to each item
              $cond: [
                { // condition block
                  $or: [
                    { $eq: ["$$spec.name", "Chipset"] },
                    { $eq: ["$$spec.name", "RAM size"] },
                    { $eq: ["$$spec.name", "Display size"] },
                    { $eq: ["$$spec.name", "Display resolution"] }
                  ]
                },
                // if true, replace value field based on matching name
                {
                  $mergeObjects: [
                    "$$spec", // the original spec object
                    {
                      value: {
                        $switch: {
                          branches: [
                            { case: { $eq: ["$$spec.name", "Chipset"] }, then: { $arrayElemAt: ["$chipsetInfo.name", 0] } },
                            { case: { $eq: ["$$spec.name", "RAM size"] }, then: { $arrayElemAt: ["$ramInfo.name", 0] } },
                            { case: { $eq: ["$$spec.name", "Display size"] }, then: { $arrayElemAt: ["$displaySizeInfo.name", 0] } },
                            { case: { $eq: ["$$spec.name", "Display resolution"] }, then: { $arrayElemAt: ["$displayResolutionInfo.name", 0] } }
                          ],
                          default: "$$spec.value" // value doesn't change if one of the cases matches.
                        }
                      }
                    }
                  ]
                },
                // if false, do nothing...
                "$$spec" // two dollar signs for a variable
              ]
            }
          }
        }
      }
    },
    { $unset: ["chipsetInfo", "ramInfo", "displaySizeInfo", "displayResolutionInfo"] }

  ]).toArray();

  return products;
}

module.exports = getProductsByBrand;
// (async () => {
//     const products = await getProductsByBrand("Apple");
//     console.log(products);
// })();