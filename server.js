const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para recibir la Webhook de TikFinity
// Endpoint para recibir la Webhook de TikFinity
app.post('/webhook', (req, res) => {
    const data = req.body;
    console.log('Webhook recibida:', data);

    // Emitir evento a la overlay en tiempo real
    io.emit('pinned_comment', {
        nickname: data.nickname || data.username || data.value1 || 'Usuario',
        comment: data.content || data.commandParams || data.value2 || '',
        avatar: data.profilePictureUrl || data.avatar || 'https://www.tiktok.com/favicon.ico'
    });

    res.status(200).send({ status: 'success' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
