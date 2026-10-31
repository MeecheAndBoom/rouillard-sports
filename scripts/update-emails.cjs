const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const env = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
const uri = env.match(/MONGODB_URI=(.*)/)[1].trim();
(async()=>{
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const r1 = await db.collection("admins").updateMany({}, {$set:{email:"info@rouillardsport.com"}});
    console.log("admins updated", r1.modifiedCount);
    const r2 = await db.collection("users").updateMany({}, {$set:{email:"info@rouillardsport.com", "profile.email":"info@rouillardsport.com"}});
    console.log("users updated", r2.modifiedCount);
    await mongoose.disconnect();
    console.log("done");
  } catch(e) {
    console.error(e.message);
    process.exit(1);
  }
})();
