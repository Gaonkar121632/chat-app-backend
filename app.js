const { json } = require('express');

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
io.origins('*:*')
app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});

let allUser={}
io.on('connection', (socket) => {
  console.log('a user connected',socket.id);
  socket.on('newUser', function (data, sessionId) {
    allUser[socket.id]=data
    console.log("new user added",data,socket.id,allUser);
    io.emit('startPath', JSON.stringify(allUser));
  });

  socket.on('request', function (data, sessionId) {
    io.to(data).emit('request', socket.id);
  });

  socket.on('reject', function (data, sessionId) {
    io.to(data).emit('reject', socket.id);
  });

  socket.on('accept', function (data, sessionId) {
    io.to(data).emit('accept', socket.id);
  });

  socket.on('send-txt', function (data, sessionId) {
    console.log("gotit",data);
    io.to(data.id).emit('send-txt', data.text);
  });

  socket.on('quit-session', function (data, sessionId) {
    // console.log("gotit",data);
    io.to(data).emit('quit-session', "quit this session");
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete allUser[socket.id]
    io.emit('diconnected',socket.id);
  });
});
app.set('port', process.env.PORT || 3000);
http.listen(app.get('port'), () => {
  console.log('listening on *:3000');
});