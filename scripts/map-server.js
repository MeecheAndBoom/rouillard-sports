/** Tiny server for the OSM map capture: serves this dir + accepts POST /save. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const OUT = path.join(process.cwd(), "public", "images", "map-lyon.jpg");

http
  .createServer((req, res) => {
    if (req.method === "POST" && req.url === "/save") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        try {
          const dataUrl = JSON.parse(body).dataUrl;
          const b64 = dataUrl.split(",")[1];
          fs.writeFileSync(OUT, Buffer.from(b64, "base64"));
          res.writeHead(200);
          res.end("ok");
          console.log("saved", OUT, fs.statSync(OUT).size, "bytes");
        } catch (e) {
          res.writeHead(400);
          res.end(String(e));
        }
      });
      return;
    }
    const p = path.join(process.cwd(), "scripts", req.url === "/" ? "map-capture.html" : req.url);
    fs.readFile(p, (e, d) => {
      if (e) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(d);
    });
  })
  .listen(8124, "127.0.0.1", () => console.log("map server on 8124"));
