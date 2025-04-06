
const connectDB = require("../database_connect");
const addLaunchYear = require("./addLaunchYear");


(async () => {
    const db = await connectDB()
    await addLaunchYear(db)
  })();