const connectDB = require("../database_connect");
const { normalizeQuickSpecField } = require("./for_quickSpec_attributes");
const { normalizeDetailSpecField } = require("./for_detailSpec_attributes");
const { normalizeRootField } = require("./for_root_attributes");
const addLaunchYear = require("../AddAttributes/addLaunchYear");

async function runAllNormalizations() {
  const db = await connectDB();
  // for root attributes
  await normalizeRootField(db,"brand")
  // for quickSpec attributes
  await normalizeQuickSpecField(db, "RAM size");
  await normalizeQuickSpecField(db, "Chipset");
  await normalizeQuickSpecField(db, "Display size");
  await normalizeQuickSpecField(db, "Display resolution");

  // for detailSpec attributes
  await normalizeDetailSpecField(db, "Platform", "Chipset");
}

runAllNormalizations().catch(console.error);
