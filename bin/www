const app = require("../app");
const http = require("http");

const port = process.env.PORT || "3000";
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);

server.on("error", (err) => {
  console.log(`Error:${err.message}`);
});

server.on("listening", () => {
  console.log(`Server is up and running`);
});

// Handling unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
