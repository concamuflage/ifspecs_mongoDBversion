

db.products.aggregate([
    { $unwind: "$quickSpec" },
    { $match: { "quickSpec.name": "RAM size" } },
    { $group: { _id: "$quickSpec.value" } },
    { $count: "uniqueRamSizes" }
  ])