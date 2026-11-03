const { Server } = require("socket.io");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { verifyAccessToken } = require("../utils/generateTokens");
const User = require("../models/User");
const Session = require("../models/Session");
const { checkOrigin, isAllowedOrigin } = require("../config/cors");

/**
 * Realtime channel (Socket.IO). Purely additive — no REST API changes.
 *
 * Rooms:
 *   (everyone)     public catalog/settings events
 *   user:<id>      a signed-in customer's own orders, notifications, cart/wishlist
 *   admins         admin dashboard / orders / payments / inventory / users / coupons
 *
 * Auth: pass the normal access token as `auth: { token }` in the handshake.
 * Connections without a token are allowed and only receive public events.
 * A token that is invalid, revoked or for an inactive account is treated as
 * anonymous (never rejected), so an expired token never breaks the page.
 */
let io = null;

const ADMINS_ROOM = "admins";
const userRoom = (userId) => `user:${userId}`;

const resolveUser = async (token) => {
  if (!token) return null;
  try {
    const decoded = verifyAccessToken(token);
    const [user, sessionActive] = await Promise.all([
      User.findById(decoded.id).select("role isActive").lean(),
      decoded.sid && mongoose.isValidObjectId(decoded.sid)
        ? Session.exists({ _id: decoded.sid, revokedAt: null })
        : true,
    ]);
    if (!user || !user.isActive || !sessionActive) return null;
    return user;
  } catch {
    return null;
  }
};

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    path: "/socket.io",
    // Same origin policy as the REST API (config/cors.js); native apps send no Origin.
    cors: { origin: checkOrigin, credentials: true },
    // Browsers skip CORS for WebSocket upgrades, so check the origin here too.
    allowRequest: (req, callback) => callback(null, isAllowedOrigin(req.headers.origin)),
    pingInterval: 25000,
    pingTimeout: 20000,
    maxHttpBufferSize: 1e5, // clients only listen; no large uploads over the socket
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || null;
    socket.data.user = await resolveUser(token);
    next();
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    if (user) {
      socket.join(userRoom(user._id));
      if (user.role === "admin") socket.join(ADMINS_ROOM);
    }
    // Clients can re-authenticate after a token refresh without reconnecting.
    socket.on("auth", async (token) => {
      const next = await resolveUser(typeof token === "string" ? token : null);
      socket.rooms.forEach((room) => room !== socket.id && socket.leave(room));
      socket.data.user = next;
      if (next) {
        socket.join(userRoom(next._id));
        if (next.role === "admin") socket.join(ADMINS_ROOM);
      }
    });
  });

  logger.info("Socket.IO realtime ready");
  return io;
};

// Emit helpers — safe no-ops until initSocket runs (scripts, tests).
const emitToAll = (event, payload) => io?.emit(event, payload);
const emitToAdmins = (event, payload) => io?.to(ADMINS_ROOM).emit(event, payload);
const emitToUser = (userId, event, payload) => userId && io?.to(userRoom(String(userId))).emit(event, payload);

const closeSocket = () => io?.close();

module.exports = { initSocket, emitToAll, emitToAdmins, emitToUser, closeSocket };
