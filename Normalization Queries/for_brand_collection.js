// for normalizing the brands
const brandNames = db.brands.distinct("name");

brandNames.forEach(name => {
  const brandDoc = db.brands.findOne({ name: name });
  if (brandDoc) {
    db.products.updateMany(
      { brand: name },
      { $set: { brand_id: brandDoc._id }, $unset: { brand: "" } }
    );
  }
});

db.products.find({ brand_id: { $exists: true } }).count()