const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || '3000';

app.use(express.static(path.join(__dirname, './docs')));
app.get('/', (req, res) => res.redirect('/index.html'));

io.on('connection', socket => {
    console.log('User connected');
});

http.listen(PORT, () => console.log('Listening on '+PORT));
