const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Game routes
const gamesRoutes = require('./routes/gamesRoutes');
app.use('/api/games', gamesRoutes);

// User/profile/member routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API Running');
});

// MongoDB connection and server start
const PORT = process.env.PORT || 5000;

// Add more detailed MongoDB connection logging
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGO_URI ? 'URI is set' : 'URI is missing');

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected successfully');
    // --- Socket.IO setup ---
    const http = require('http');
    const server = http.createServer(app);
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);
      socket.on('chat message', (msg) => {
        // Broadcast the message to all clients
        io.emit('chat message', msg);
      });
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
    // --- End Socket.IO setup ---
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
