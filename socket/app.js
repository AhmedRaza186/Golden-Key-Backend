import { Server } from "socket.io";
import dotenv from 'dotenv'

dotenv.config()


console.log(process.env.CLIENT_URL);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5174";
const allowedOrigins = [
  clientUrl,
  clientUrl.endsWith('/') ? clientUrl.slice(0, -1) : clientUrl + '/'
];

const io = new Server({
  cors: {
    origin: allowedOrigins,
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExits = onlineUser.find((user) => user.userId === userId);
  if (!userExits) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

const PORT = process.env.PORT || 4000;
io.listen(PORT);