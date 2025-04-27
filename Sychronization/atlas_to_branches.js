const connectDB = require("../database_connect");
const aws_connectDB = require("../database_connect_aws");
const gcloud_connectDB = require("../database_connect_gcloud");

async function full_synch() {
  const db_atlas = await connectDB();
  const db_aws = await aws_connectDB();
  const db_gcloud = await gcloud_connectDB();


  const atlasBrands = db_atlas.collection("brands");
  const awsBrands = db_aws.collection("brands");
  const gcloudBrands = db_gcloud.collection("brands");

  // If the Gcloud collection is empty, copy all docs from Atlas to gcloud
  const count_gcloud = await gcloudBrands.countDocuments();
  if (count_gcloud === 0) {
    const allDocs = await atlasBrands.find().toArray();
    if (allDocs.length > 0) {
      await gcloudBrands.insertMany(allDocs);
      console.log(`Inserted ${allDocs.length} documents from Atlas 'brands' collection to Gcloud'brands' collection`);
    }
  }
  
  // If the AWS collection is empty, copy all docs from Atlas to AWS
  const count_aws = await awsBrands.countDocuments();
  if (count_aws === 0) {
    const allDocs = await atlasBrands.find().toArray();
    if (allDocs.length > 0) {
      await awsBrands.insertMany(allDocs);
      console.log(`Inserted ${allDocs.length} documents from Atlas 'brands' collection to AWS 'brands' collection`);
    }
  }

  // populate the change to gcloud and aws.
  async function listenToChanges(atlasBrands, gcloudBrands, awsBrands) {
    let changeStream;

    const startStream = () => {
      changeStream = atlasBrands.watch();

      changeStream.on("change", async (change) => {
        const docId = change.documentKey._id;

        // Sync to gcloud
        (async () => {
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

            console.log(`Atlas -> Gcloud sync: ${change.operationType.toUpperCase()} operation on 'brands' collection, _id: ${docId}`);
          } catch (err) {
            console.error("Error syncing change from Atlas to Gcloud 'brands' collection:", err);
          }
        })();

        // Sync to AWS
        (async () => {
          try {
            if (change.operationType === "insert") {
              await awsBrands.insertOne(change.fullDocument);
            } else if (change.operationType === "update") {
              await awsBrands.updateOne(
                { _id: docId },
                { $set: change.updateDescription.updatedFields }
              );
            } else if (change.operationType === "delete") {
              await awsBrands.deleteOne({ _id: docId });
            }

            console.log(`Atlas -> AWS sync: ${change.operationType.toUpperCase()} operation on 'brands' collection, _id: ${docId}`);
          } catch (err) {
            console.error("Error syncing change from Atlas to AWS 'brands' collection:", err);
          }
        })();
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

  await listenToChanges(atlasBrands, gcloudBrands, awsBrands);
}

full_synch().catch(console.error);
