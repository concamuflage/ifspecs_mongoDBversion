// a function for normalizing attributes nested in detailSpec
async function normalizeDetailSpecField(db,category, fieldName) {
  const valueSet = new Set();
  let totalModified = 0;

  const cursor = db.collection('products').find();

    // put all the values in docs in a set.
  for await (const product of cursor) {
    const section = product.detailSpec?.find(detail => detail.category === category);
    if (section) {
      const fieldSpec = section.specifications.find(spec => spec.name === fieldName);
      if (fieldSpec && typeof fieldSpec.value === "string") {
        const trimmedValue = fieldSpec.value.trim();
        if (trimmedValue === "") {
          fieldSpec.value = null;
        } else {
          valueSet.add(trimmedValue);
        }
      }
    }
  }


  const collectionName = fieldName.toLowerCase().replace(/\s+/g, '_') + 's';
  const referenceCollection = db.collection(collectionName); // creates a collection if doesn't exist yet.

  // insert the values into collection.
  for (const value of valueSet) {
    // store each value in the collection if they are not in the collection yet.
    // { name: value } name is a string literal, 
    const existingDoc = await referenceCollection.findOne({ name: value });
    if (!existingDoc) {
      await referenceCollection.insertOne({ name: value });
    }
    // find the document
    const refDoc = await referenceCollection.findOne({ name: value });
    const result = await db.collection('products').updateMany(
      {
        detailSpec: {
          $elemMatch: {
            category: category,
            "specifications.name": fieldName,
            "specifications.value": value
          }
        }
      },
      {
        $set: {
          "detailSpec.$[section].specifications.$[spec].value": refDoc._id
        }
      },
      {
        arrayFilters: [
          { "section.category": category },
          { "spec.name": fieldName, "spec.value": value }
        ]
      }
    );

    totalModified += result.modifiedCount;
  }

  console.log(`Normalization for ${fieldName} in ${category} complete.`);
  console.log(`Total documents updated: ${totalModified}`);
}



module.exports = { normalizeDetailSpecField };