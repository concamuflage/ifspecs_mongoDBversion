/**
 * Scans all products in the database and extracts the launch year
 * from the "Announced" field in the "Launch" section of `detailSpec`.
 * 
 * If a 4-digit year is found at the beginning of the value string,
 * it sets that value as the `launch_year` field for the product document.
 *
 * Skips any products that are missing the Launch section or an Announced date.
 *
 * @param {object} db - A MongoDB database instance returned by connectDB().
 * @returns {Promise<void>} Resolves when all applicable products have been updated.
 */

async function addLaunchYear(db) {

  const products = db.collection("products");
  let updatedCount = 0;

  const cursor = products.find();
  for await (const product of cursor) {

    const launchSection = product.detailSpec?.find(
      (section) => section.category === "Launch"
    );
    if (!launchSection) {
      continue;
    }

    const announcedSpec = launchSection.specifications?.find(
      (spec) => spec.name === "Announced"
    );
    if (!announcedSpec || typeof announcedSpec.value !== "string") {
      continue;
    }

    const yearPart = announcedSpec.value.trim().substring(0, 4);
    if (!/^\d{4}$/.test(yearPart)) {
      continue;
    }

    const launch_year = parseInt(yearPart);
    const result = await products.updateOne(
      { _id: product._id },
      { $set: { launch_year } }
    );
    if (result.modifiedCount > 0) {
      updatedCount++;
    }
  }

  console.log(`Finished updating products with launch_year. Total updated: ${updatedCount}`);
}

module.exports = addLaunchYear;