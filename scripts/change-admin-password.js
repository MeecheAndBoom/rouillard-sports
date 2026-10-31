const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const env = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
const uri = env.match(/MONGODB_URI=(.*)/)[1].trim();
(async () => {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const bcrypt = require("bcryptjs");
  const hash = await bcrypt.hash("RouillardSport100$", 12);
  await db.collection("admins").deleteMany({});
  await db.collection("admins").insertOne({ email: "info@rouillardsport.com", passwordHash: hash });
  await db.collection("users").updateMany({ email: "info@rouillardsport.com" }, { $set: { role: "admin", passwordHash: hash } });
  console.log("done");
  await mongoose.disconnect();
})();
