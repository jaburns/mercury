import path = require('path');
import express = require('express');
import io = require('socket.io');
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const ioApp = io(server);

const PORT = process.env.PORT || '3000';

app.use(express.static(path.join(__dirname, './docs')));
app.get('/', (req, res) => res.redirect('/index.html'));

ioApp.on('connection', socket => {
    console.log('User connected');
});

server.listen(PORT, () => console.log('Listening on '+PORT));

console.log('hello server');
