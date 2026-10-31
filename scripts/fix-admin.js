const m = require("mongoose");
const fs = require("fs");
const env = fs.readFileSync(".env.local", "utf8");
const uri = env.match(/MONGODB_URI=(.*)/)[1].trim();
m.connect(uri).then(async function() {
  const db = m.connection.db;
  await db.collection("admins").deleteMany({});
  await db.collection("admins").insertOne({ email: "info@rouillardsport.com" });
  console.log("ok");
  await m.disconnect();
});
