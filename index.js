// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var uuid = require('node-uuid');
var gravatar = require('gravatar');

server.listen(port, function () {
    console.log('Server listening @ %d', port);
});

// Server static content
app.use(express.static(__dirname + '/public'));

var chatRooms = [];

// Chatroom
io.on('connection', function (socket){

    // Create Room Handler
    socket.on('create-room', function(data){
        var chatRoom = {};
        chatRoom.roomId = uuid.v4();
        chatRoom.users = [];
        chatRoom.messages = [];

        var user = {};
        user.userId = uuid.v4();
        user.email = data.email;
        user.name = data.name;
        user.role = 'admin';

        // Gravatar Image Url Generator
        user.image = gravatar.url(data.email, { s: 50 }, true);

        // Create a new chat room and join the admin
        socket.join(chatRoom.roomId);

        chatRoom.users.push(user);
        chatRooms.push(chatRoom);

        // Chat room created callback
        //io.to(chatRoom.roomId).emit('room-created', chatRoom.roomId);
        socket.emit('room-created', { roomid: chatRoom.roomId, userid: user.userId });
    });

    // Join Room Handler
    socket.on('join-room', function(data){
        // User joins to the chat room
        socket.join(data.roomid);

        // Check if User already present in the chat room
        for(var room = 0; room < chatRooms.length; room++){
            if(chatRooms[room].roomId == data.roomid) {
                for (var usr = 0; usr < chatRooms[room].users.length; usr++) {
                    if (chatRooms[room].users[usr].email == data.email) {
                        // User already present in the room
                        socket.emit('room-joined', { roomid: data.roomid, userid: chatRooms[room].users[usr].userId });
                        socket.broadcast.to(data.roomid).emit('user-joined', chatRooms[room].users);
                        return;
                    }
                }
            }
        }

        var user = {};
        user.userId = uuid.v4();
        user.email = data.email;
        user.name = data.name;
        user.role = 'user';
        user.image = gravatar.url(data.email, { s: 50 }, true);

        for(var r = 0; r < chatRooms.length; r++){
            if(chatRooms[r].roomId == data.roomid){
                // Push User to the chat room
                chatRooms[r].users.push(user);
                socket.emit('room-joined', { roomid: data.roomid, userid: user.userId });
                socket.broadcast.to(data.roomid).emit('user-joined', chatRooms[r].users);
                return;
            }
        }

        socket.emit('room-not-found');
    });

    // Get Room Details
    socket.on('get-room-details', function (data) {
        for(var room = 0; room < chatRooms.length; room++){
            if(chatRooms[room].roomId == data.roomid){
                for(var usr = 0; usr < chatRooms[room].users.length; usr++){
                    if(chatRooms[room].users[usr].userId == data.userid){
                        // User already present in the room
                        socket.emit('room-details', chatRooms[room]);
                        return;
                    }
                }
            }
        }

        socket.emit('room-details-error');
    });

    socket.on('room-message', function (data) {
        var message = { user: data.user, message: data.message };

        for(var room = 0; room < chatRooms.length; room++){
            if(chatRooms[room].roomId == data.roomid) {
                chatRooms[room].messages.push(message);
                break;
            }
        }

        io.to(data.roomid).emit('room-message', message);
    });
});