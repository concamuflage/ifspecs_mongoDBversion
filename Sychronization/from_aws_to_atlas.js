const connectDB = require("../database_connect");
const aws_connectDB = require("../database_connect_aws");

const SYNC_INTERVAL_MS = parseInt(process.env.SYNC_INTERVAL_MS || "30000", 10); // Interval in milliseconds (30 seconds default)


/*
The following function synchs docs from aws(branch database) mongodb to atlas(hq database)
It removes detailSpec attribute from the docs because HQ doesn't need detailSpec.
*/

async function partial_synch_aws_to_atlas() {
  const db_atlas = await connectDB();
  const db_aws = await aws_connectDB();

  const atlasSimplifiedProducts = db_atlas.collection("simplified_product");
  const awsProducts = db_aws.collection("products_not_normalized");

  const syncData = async () => {
    
    try {
      // put all ._id in atlas in a set.
      const awsDocs = await awsProducts.find().toArray();
      const atlasIds = new Set(
        (await atlasSimplifiedProducts.find({}, { projection: { _id: 1 } }).toArray()).map((doc) => doc._id)
      );

      // synching by comparing the ._id in aws with ._id in atlas.
      for (const doc of awsDocs) {

        const { detailSpec, _id, ...rest } = doc; // ...rest variables contains no detailSpec or the _id now.
        const prefixedId = `aws_${_id.toString()}`;
        const docWithoutDetailSpec = { _id: prefixedId, ...rest }; // add the prefixedid to the doc
        
        if (!atlasIds.has(prefixedId)) {
          await atlasSimplifiedProducts.insertOne(docWithoutDetailSpec);
          console.log(`Inserted new AWS doc into Atlas 'simplified_product', _id: ${prefixedId}`);
        } else {
          await atlasSimplifiedProducts.replaceOne({ _id: prefixedId }, docWithoutDetailSpec);
          console.log(`Updated AWS doc in Atlas 'simplified_product', _id: ${prefixedId}`);
        }
      }

      console.log("AWS -> Atlas sync: Completed full sync of 'product_not_normalized' collection.");
    } catch (err) {
      console.error("Error syncing data from AWS to Atlas 'product_not_normalized' collection:", err);
    }
  };

  await syncData(); // initial sync

  setInterval(syncData, SYNC_INTERVAL_MS); // subsequent syncs
}

partial_synch_aws_to_atlas().catch(console.error);