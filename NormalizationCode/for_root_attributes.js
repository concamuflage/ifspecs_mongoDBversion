// This script normalizes a root-level field in the 'products' collection.
// It moves unique field values into a separate collection and replaces the original value with a reference (_id).

/**
 * Normalize a root-level field in the 'products' collection.
 * @param {Object} db - The MongoDB database instance.
 * @param {string} fieldName - The name of the field to normalize.
 */
async function normalizeRootField(db, fieldName) {
  // Store unique field values found in the products collection
  const fieldSet = new Set();
  let totalModified = 0;

  // Find all documents in the 'products' collection
  const cursor = db.collection('products').find();
  // Iterate over each product document
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

  // Prepare the name for the new referenced collection (e.g., 'brands' from 'brand')
  const collectionName = fieldName.toLowerCase().replace(/\s+/g, '_') + 's';
  const fieldCollection = db.collection(collectionName);

  // Insert each unique value into the referenced collection if it doesn't already exist
  for (const value of fieldSet) {
    // Check if the value already exists
    const existingDoc = await fieldCollection.findOne({ name: value });
    if (!existingDoc) {
      // Insert new value into the referenced collection
      await fieldCollection.insertOne({ name: value });
    }
    // Retrieve the inserted or existing document to get its _id
    const fieldDoc = await fieldCollection.findOne({ name: value });
    // Update all products that have the current value, replacing it with the _id
    const result = await db.collection('products').updateMany(
      { [fieldName]: value },
      { $set: { [fieldName]: fieldDoc._id } }
    );

    totalModified += result.modifiedCount;
  }

  // Log the normalization completion and total modified documents
  console.log(`${fieldName} normalization complete.`);
  console.log(`Total documents updated: ${totalModified}`);
}

module.exports = { normalizeRootField };