const fs = require("node:fs");
const crypto = require("node:crypto");
const buffer = require("node:buffer");

const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

const chunks = [];

server.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case "RECORDING_START:REQUEST":
        console.log(data);
        chunks.push(data.chunk);
        break;
      case "RECORDING_END:REQUEST":
        fs.writeFileSync(
          `.recordings/${crypto.randomUUID()}.webm`,
          buffer.Buffer.from(chunks)
        );
        break;
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
