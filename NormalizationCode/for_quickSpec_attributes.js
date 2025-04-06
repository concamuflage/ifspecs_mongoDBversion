// a function for normalizing attributes nested in quickSpec
async function normalizeQuickSpecField(db,fieldName) {
  const fieldSet = new Set();
  let totalModified = 0;

  // Get all unique values for the given quickSpec field
  const cursor = db.collection('products').find();
    // cursor retrieves one product doc a time
  for await (const product of cursor) {
    const fieldSpec = product.quickSpec?.find(spec => spec.name === fieldName);
    if (fieldSpec && typeof fieldSpec.value === "string") {
      const trimmedValue = fieldSpec.value.trim();
      if (trimmedValue === "") {
        fieldSpec.value = null;
      } else {
        fieldSet.add(trimmedValue);
      }
    }
  }

  // Normalize field values: upsert into a corresponding collection and update product documents
    // Build new collection and populate it
  const collectionName = fieldName.toLowerCase().replace(/\s+/g, '_') + 's'; // /\s+/g replace one or more whitespace character with _ 
  const fieldCollection = db.collection(collectionName);
  for (const value of fieldSet) {
    // store each value in the collection if they are not in the collection yet.
    // { name: value } name is a string literal, 
    const existingDoc = await fieldCollection.findOne({ name: value });
    if (!existingDoc) {
      await fieldCollection.insertOne({ name: value });
    }

    const fieldDoc = await fieldCollection.findOne({ name: value });
    const result = await db.collection('products').updateMany(
      {
        quickSpec: {
          $elemMatch: {
            name: fieldName,
            value:value
          }
        }
      },
      {
        $set: {
          "quickSpec.$[spec].value": fieldDoc._id
        }
      },
      {
        arrayFilters: [
          { "spec.name": fieldName, "spec.value": value }
        ]
      }
    );

    totalModified += result.modifiedCount;
  }

  console.log(`✅ ${fieldName} normalization complete.`);
  console.log(`Total documents updated: ${totalModified}`);
}


module.exports = { normalizeQuickSpecField };