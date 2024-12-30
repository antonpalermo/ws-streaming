const fs = require("node:fs");
const crypto = require("node:crypto");
const buffer = require("node:buffer");

const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

const chunks = [];

server.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", async (message) => {
    chunks.push(message);
  });

  ws.on("close", async () => {
    const videoBlob = new Blob(chunks, { type: "video/webm; codecs=vp9" });
    const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());
    fs.writeFileSync(
      `.recordings/pre-${crypto.randomUUID()}.webm`,
      videoBuffer
    );
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
