const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal que sirve el HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint que recibe la notificación de TikFinity
app.post('/webhook', (req, res) => {
  console.log('📩 Petición recibida de TikFinity:', req.body);

  // Extraemos la información del usuario enviada por TikFinity
  const username = req.body.nickname || req.body.uniqueId || req.body.username || 'Usuario';
  const avatar = req.body.profilePictureUrl || req.body.avatar || 'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/1665223501968390~c5_100x100.jpeg';

  const payload = {
    username: username,
    avatar: avatar,
    comment: 'vouch' // Forzado a decir exactamente "vouch"
  };

  // Emitimos el evento a todos los navegadores / OBS conectados
  io.emit('pinned-comment', payload);

  res.status(200).json({ status: 'ok', message: 'Vouch emitido correctamente' });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});
