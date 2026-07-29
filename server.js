const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());
app.use(express.static('public'));

// Endpoint para recibir la Webhook de TikFinity
app.post('/webhook', (req, res) => {
  const data = req.body;
  console.log('Webhook recibida:', data);

  // Emitir evento a la overlay en tiempo real
  io.emit('pinned_comment', {
    nickname: data.nickname || data.uniqueId || 'Usuario',
    comment: data.comment || data.text || '',
    avatar: data.profilePictureUrl || data.avatar || ''
  });

  res.status(200).send({ status: 'success' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
