// A function to normalize a specific field nested inside the "detailSpec" array of the "products" collection.
// It moves all unique values of the field into a separate collection and replaces the field values with references (ObjectIds).
async function normalizeDetailSpecField(db,category, fieldName) {
  const valueSet = new Set();
  let totalModified = 0;

  const cursor = db.collection('products').find();

  // Iterate through each product to collect unique field values
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

  // Determine the name of the reference collection based on the field name
  const collectionName = fieldName.toLowerCase().replace(/\s+/g, '_') + 's';
  const referenceCollection = db.collection(collectionName); // MongoDB will create this collection if it doesn't exist yet.

  // Insert unique field values into the reference collection if they don't exist
  for (const value of valueSet) {
    // Check if the value already exists
    const existingDoc = await referenceCollection.findOne({ name: value });
    if (!existingDoc) {
      await referenceCollection.insertOne({ name: value });
    }
    // Find the newly inserted or existing document
    const refDoc = await referenceCollection.findOne({ name: value });

    // Update all products to replace the string value with the reference ObjectId
    const result = await db.collection('products').updateMany(
      {
        detailSpec: {
          // Match an element inside the detailSpec array where:
          $elemMatch: {
            category: category, // The 'category' field matches the provided category argument
            "specifications.name": fieldName, // Inside 'specifications' array, find an element where 'name' matches the fieldName argument
            "specifications.value": value // And the 'value' field matches the specific value to normalize
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
          // section refers to an element in the specification array.
          { "section.category": category }, // Only update the section matching the given category
          { "spec.name": fieldName, "spec.value": value } // Only update the spec with matching name and value
        ]
      }
    );

    totalModified += result.modifiedCount;
  }

  // Log final results
  console.log(`Normalization for ${fieldName} in ${category} complete.`);
  console.log(`Total documents updated: ${totalModified}`);
}

// Export the function to be used elsewhere
module.exports = { normalizeDetailSpecField };