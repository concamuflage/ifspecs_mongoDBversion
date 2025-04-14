const connectDB = require("../database_connect");
const aws_connectDB = require("../database_connect_aws");

async function full_synch_atlas_to_aws() {
  const db_atlas = await connectDB();
  const db_aws = await aws_connectDB();

  const atlasBrands = db_atlas.collection("brands");
  const gcloudBrands = db_aws.collection("brands");

  // If the destination collection is empty, copy all docs from Atlas
  const count = await gcloudBrands.countDocuments();
  if (count === 0) {
    const allDocs = await atlasBrands.find().toArray();
    if (allDocs.length > 0) {
      await gcloudBrands.insertMany(allDocs);
      console.log(`Inserted ${allDocs.length} documents from Atlas 'brands' collection to AWS 'brands' collection`);
    }
  }
  
  async function listenToChanges(atlasBrands, gcloudBrands) {
    let changeStream;

    const startStream = () => {
      changeStream = atlasBrands.watch();

      changeStream.on("change", async (change) => {
        const docId = change.documentKey._id;

        try {
          if (change.operationType === "insert") {
            await gcloudBrands.insertOne(change.fullDocument);
          } else if (change.operationType === "update") {
            await gcloudBrands.updateOne(
              { _id: docId },
              { $set: change.updateDescription.updatedFields }
            );
          } else if (change.operationType === "delete") {
            await gcloudBrands.deleteOne({ _id: docId });
          }

          console.log(`Atlas -> AWS sync: ${change.operationType.toUpperCase()} operation on 'brands' collection, _id: ${docId}`);
        } catch (err) {
          console.error("Error syncing change from Atlas to AWS 'brands' collection:", err);
        }
      });

      changeStream.on("error", async (err) => {
        console.error("Change stream error on Atlas 'brands' collection:", err);
        changeStream.close();
        console.log("Attempting to reconnect to Atlas 'brands' change stream in 5 seconds...");
        setTimeout(startStream, 5000);
      });

      console.log("Listening for changes on Atlas 'brands' collection...");
    };

    startStream();
  }

  await listenToChanges(atlasBrands, gcloudBrands);
}

full_synch_atlas_to_aws().catch(console.error);
