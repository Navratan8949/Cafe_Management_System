require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { app } = require("./app");
const connectDB = require("./db/index");

const port = process.env.PORT || 8000;

// Create HTTP server wrapping the Express app
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Pass io to Express app
app.set("io", io);

// Socket connection handling
io.on("connection", (socket) => {
  console.log("New client connected: ", socket.id);

  socket.on("joinHotelRoom", (hotelId) => {
    socket.join(hotelId);
    console.log(`Socket ${socket.id} joined room ${hotelId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
  });
});

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`⚙️ Server is running at port : ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
