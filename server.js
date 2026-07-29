const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Inicializamos el conector de tiempo real (Socket.io)
const io = new Server(server, {
  cors: { origin: "*" }
});

// Permite que el servidor entienda datos JSON que manda TikFinity
app.use(express.json());

// -------------------------------------------------------------
// RUTA 1: Lo que se muestra cuando abres la URL en el navegador
// -------------------------------------------------------------
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>TikFinity Overlay</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: transparent; /* Transparente para OBS */
          color: #fff;
          margin: 0;
          padding: 20px;
        }
        .alert-card {
          background: rgba(15, 15, 20, 0.9);
          border-left: 5px solid #00f2fe;
          padding: 14px 18px;
          margin-bottom: 10px;
          border-radius: 8px;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          animation: popIn 0.3s ease-out;
        }
        @keyframes popIn {
          from { opacity: 0; transform: translateY(-15px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      </style>
      <!-- Cargamos el cliente de Socket.io -->
      <script src="/socket.io/socket.io.js"></script>
    </head>
    <body>
      <div id="overlay-container"></div>

      <script>
        const socket = io();
        const container = document.getElementById('overlay-container');

        // Escuchamos el evento cuando el servidor nos avise que llegó algo
        socket.on('tikfinity-event', (data) => {
          console.log('Evento recibido en vivo:', data);
          
          const card = document.createElement('div');
          card.className = 'alert-card';
          
          // Si el evento contiene un regalo
          if (data.giftName) {
            card.innerHTML = \`🎁 <strong>\${data.nickname || data.username}</strong> envió <strong>\${data.repeatCount || 1}x \${data.giftName}</strong>!\`;
          } 
          // Si es un mensaje o prueba
          else if (data.content) {
            card.innerHTML = \`💬 <strong>\${data.nickname || data.username}</strong>: \${data.content}\`;
          } 
          // Cualquier otro formato
          else {
            card.innerHTML = \`✨ <strong>\${data.nickname || data.username}</strong>: \${data.value2 || 'Evento recibido'}\`;
          }

          // Agregamos la alerta arriba del todo
          container.prepend(card);
        });
      </script>
    </body>
    </html>
  `);
});

// -------------------------------------------------------------
// RUTA 2: El Webhook que recibe la información de TikFinity
// -------------------------------------------------------------
app.post('/', (req, res) => {
  const data = req.body;
  console.log('Webhook recibida:', data);

  // Emitimos los datos en tiempo real a todas las pantallas conectadas
  io.emit('tikfinity-event', data);

  res.status(200).send({ status: 'ok' });
});

// -------------------------------------------------------------
// PUERTO Y ARRANQUE DEL SERVIDOR
// -------------------------------------------------------------
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
