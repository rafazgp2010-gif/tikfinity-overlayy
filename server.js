const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());

// 1. HTML con diseño idéntico al chat de TikTok Live
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>TikTok Live Chat Overlay</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Proxima+Nova:wght@400;600;700&display=swap');

        body {
          font-family: 'Proxima Nova', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
          background-color: transparent;
          color: #ffffff;
          margin: 0;
          padding: 20px;
          display: flex;
          flex-direction: column-reverse; /* Los mensajes nuevos entran abajo como en TikTok */
          gap: 8px;
          overflow: hidden;
        }

        .chat-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(0, 0, 0, 0.45); /* Fondo oscuro transparente */
          backdrop-filter: blur(4px);
          padding: 8px 12px;
          border-radius: 14px;
          width: fit-content;
          max-width: 85%;
          animation: tiktokFadeIn 0.25s ease-out;
        }

        @keyframes tiktokFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
        }

        .content-box {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .username {
          font-size: 15px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.2;
        }

        .badge {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .badge.host {
          background: #fe2c55; /* Rojo típico de TikTok */
        }

        .message {
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          word-break: break-word;
          line-height: 1.3;
        }
      </style>
      <script src="/socket.io/socket.io.js"></script>
    </head>
    <body>
      <div id="chat-container"></div>

      <script>
        const socket = io();
        const container = document.getElementById('chat-container');

        socket.on('tikfinity-event', (data) => {
          const row = document.createElement('div');
          row.className = 'chat-row';

          const user = data.nickname || data.username || 'Usuario';
          const avatarUrl = data.profilePictureUrl || 'https://www.tiktok.com/favicon.ico';

          // Estructura idéntica al chat de TikTok Live
          row.innerHTML = \`
            <img class="avatar" src="\${avatarUrl}" onerror="this.src='https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'" />
            <div class="content-box">
              <div class="user-header">
                <span class="username">\${user}</span>
                <span class="badge">📌 Anclado</span>
              </div>
              <div class="message">Vouch</div>
            </div>
          \`;

          container.appendChild(row);

          // Mantener máximo 8 mensajes en pantalla
          if (container.children.length > 8) {
            container.removeChild(container.firstChild);
          }
        });
      </script>
    </body>
    </html>
  `);
});

// 2. Endpoint del Webhook
app.post('/', (req, res) => {
  const data = req.body;
  console.log('Webhook recibida:', data);

  io.emit('tikfinity-event', data);

  res.status(200).json({ status: 'ok' });
});

// 3. Iniciar Servidor
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
