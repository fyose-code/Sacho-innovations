import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { ExpressPeerServer } from "peer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const peerServer = ExpressPeerServer(httpServer, {
    path: "/peerjs"
  });

  app.use("/peerjs", peerServer);

  const PORT = 3000;

  // Real-time signaling and state for Virtual Boardroom
  const rooms = new Map<string, Map<string, any>>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId, userId, userName, role = "participant") => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      
      const room = rooms.get(roomId)!;
      room.set(userId, { socketId: socket.id, userId, userName, role, isMuted: false, isVideoOn: true, isSharing: false });

      // Notify others in the room
      socket.to(roomId).emit("user-connected", userId, userName, socket.id, role);

      // Send existing participants to the new user
      const existingParticipants = Array.from(room.values()).filter(u => u.userId !== userId);
      socket.emit("existing-participants", existingParticipants);

      socket.on("update-media-state", (state: { isMuted: boolean, isVideoOn: boolean, isSharing: boolean }) => {
        const user = room.get(userId);
        if (user) {
          Object.assign(user, state);
          socket.to(roomId).emit("user-state-updated", userId, state);
        }
      });

      socket.on("disconnect", () => {
        socket.to(roomId).emit("user-disconnected", userId);
        room.delete(userId);
        if (room.size === 0) rooms.delete(roomId);
      });
    });

    // Chat messages
    socket.on("send-message", (roomId, message) => {
      io.to(roomId).emit("receive-message", message);
    });

    // Meeting controls (End Meeting)
    socket.on("end-meeting", (roomId) => {
      io.to(roomId).emit("meeting-ended");
    });

    // Mute all (Admin only)
    socket.on("mute-all", (roomId) => {
      socket.to(roomId).emit("force-mute");
    });

    // Raise hand
    socket.on("raise-hand", (roomId, userId) => {
      socket.to(roomId).emit("user-raised-hand", userId);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
