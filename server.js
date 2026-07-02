const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use('/api/collaborations', require('./routes/collaborationRoutes'));

// Manual XSS/injection protection
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Sirf dangerous characters hatao, @ aur # nahi
      return obj.replace(/[<>]/g, '').replace(/\$\[/g, '').replace(/\$where/g, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => { obj[key] = sanitize(obj[key]); });
    }
    return obj;
  };
  if (req.body) req.body = sanitize(req.body);
  next();
});

// Test route
app.get('/', (req, res) => {
  res.send('Nexus Backend API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/uploads', express.static('uploads'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));

// ─── WebRTC Signaling Server ───────────────────────────────────────────────
// Tracks which users are in which rooms
const rooms = {};

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins a video call room
  socket.on('join-room', ({ roomId, userId, userName }) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ socketId: socket.id, userId, userName });

    console.log(`${userName} joined room: ${roomId}`);

    // Tell everyone else in the room that a new user joined
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userId,
      userName,
    });

    // Send the new user the list of existing participants
    const existingUsers = rooms[roomId].filter(u => u.socketId !== socket.id);
    socket.emit('existing-users', existingUsers);
  });

  // WebRTC offer (from caller to callee)
  socket.on('offer', ({ to, offer }) => {
    io.to(to).emit('offer', { from: socket.id, offer });
  });

  // WebRTC answer (from callee back to caller)
  socket.on('answer', ({ to, answer }) => {
    io.to(to).emit('answer', { from: socket.id, answer });
  });

  // ICE candidates (network path info for WebRTC connection)
  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', { from: socket.id, candidate });
  });

  // User toggles audio
  socket.on('toggle-audio', ({ roomId, muted }) => {
    socket.to(roomId).emit('user-toggle-audio', { socketId: socket.id, muted });
  });

  // User toggles video
  socket.on('toggle-video', ({ roomId, videoOff }) => {
    socket.to(roomId).emit('user-toggle-video', { socketId: socket.id, videoOff });
  });

  // User leaves room or disconnects
  socket.on('leave-room', ({ roomId }) => {
    handleLeave(socket, roomId);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Remove from all rooms
    Object.keys(rooms).forEach(roomId => {
      if (rooms[roomId].some(u => u.socketId === socket.id)) {
        handleLeave(socket, roomId);
      }
    });
  });
});

function handleLeave(socket, roomId) {
  socket.to(roomId).emit('user-left', { socketId: socket.id });
  if (rooms[roomId]) {
    rooms[roomId] = rooms[roomId].filter(u => u.socketId !== socket.id);
    if (rooms[roomId].length === 0) delete rooms[roomId];
  }
  socket.leave(roomId);
}
// ───────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});