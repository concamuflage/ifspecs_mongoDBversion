async function normalizeRootField(db, fieldName) {
  const fieldSet = new Set();
  let totalModified = 0;

  const cursor = db.collection('products').find();
  for await (const product of cursor) {
    const value = product[fieldName];
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      if (trimmedValue === "") {
        product[fieldName] = null;
      } else {
        fieldSet.add(trimmedValue);
      }
    } else if (value !== null && value !== undefined) {
      fieldSet.add(value);
    }
  }

  const collectionName = fieldName.toLowerCase().replace(/\s+/g, '_') + 's';
  const fieldCollection = db.collection(collectionName);

  for (const value of fieldSet) {
    // insert the value into the referenced collection if it doesn't exist yet.
    const existingDoc = await fieldCollection.findOne({ name: value });
    if (!existingDoc) {
      await fieldCollection.insertOne({ name: value });
    }
    // find its id
    const fieldDoc = await fieldCollection.findOne({ name: value });
    // replace the value with an id.
    const result = await db.collection('products').updateMany(
      { [fieldName]: value },
      { $set: { [fieldName]: fieldDoc._id } }
    );

    totalModified += result.modifiedCount;
  }

  console.log(`✅ ${fieldName} normalization complete.`);
  console.log(`Total documents updated: ${totalModified}`);
}

module.exports = { normalizeRootField };