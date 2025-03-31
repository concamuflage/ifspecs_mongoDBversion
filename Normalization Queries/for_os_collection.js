// Step 1: Extract unique OS names
const osSet = new Set();

db.products.find().forEach(product => {
  const platform = product.detailSpec?.find(ds => ds.category === "Platform");
  if (platform) {
    const osSpec = platform.specifications.find(spec => spec.name === "OS");
    if (osSpec && osSpec.value) {
      osSet.add(osSpec.value.trim());
    }
  }
});

// Step 2: Insert unique OS names into the `os` collection
osSet.forEach(osName => {
  db.os.updateOne(
    { name: osName },
    { $setOnInsert: { name: osName } },
    { upsert: true }
  );
});