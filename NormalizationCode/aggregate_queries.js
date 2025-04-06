// to be run in a MongoDB shell.
    // for detailSpec attributes
db.products.aggregate([
    { $unwind: "$detailSpec" },
    { $match: { "detailSpec.category": "Platform" } },
    { $unwind: "$detailSpec.specifications" },
    { $match: { "detailSpec.specifications.name": "OS" } },
    { $group: { _id: "$_id" } },
    { $count: "docsWithChipset" }
  ])
    // for quickSpec attributes
db.products.aggregate([
    { $unwind: "$quickSpec" },
    { $match: { "quickSpec.name": "Chipset" } },
    { $group: { _id: "$_id" } },
    { $count: "docsWithChipsetInQuickSpec" }
    ])
    // for root attributes
db.products.aggregate([
    { $match: { brand_id: { $exists: true, $ne: null } } },
    { $count: "docsWithBrandId" }
    ])


