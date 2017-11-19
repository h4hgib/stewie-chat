let app      = require('express')(),
    http     = require('http').Server(app),
    io       = require('socket.io')(http),
    port     = process.env.PORT || 999,
    admin    = false,
    userArr  = [],
    adminArr = [],
    adminUrl = 'admin-3fdsaserqw.html';

app.get('/'+adminUrl, function(req, res) {
    res.sendFile(__dirname + '/admin.html');
});
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    if(socket.handshake.headers.referer.indexOf(adminUrl) === -1) {
        let i = 0;

        userArr.push({ id : socket.id });

        for(i = 0; i < adminArr.length; i++) {
            if(adminArr[i]) {
                socket.broadcast.to(adminArr[i].id).emit('new user', userArr);
            }
        }
    } else {
        adminArr.push({ id : socket.id });
        io.emit('new user', userArr);
    }

    socket.on('chat message', function(msg) {
console.log('revieved "chat msg":');
console.log(msg);
        let i = 0;

        socket.emit('chat message', { msg: msg, fromId : socket.id });

        for(i = 0; i < adminArr.length; i++) {
            if(adminArr[i]) {
                socket.broadcast.to(adminArr[i].id).emit('chat message', { msg: msg, fromId : socket.id });
            }
        }
    });

    socket.on('admin message', function(msg) {
console.log('revieved "admin msg":');
console.log(msg);
        let i = 0;

        socket.emit('chat message', { msg: msg.msg, fromId : socket.id, 'forId' : msg.forId });
        socket.broadcast.to(msg.forId).emit('chat message', { msg: msg.msg, fromId : socket.id });

        for(i = 0; i < adminArr.length; i++) {
            if(adminArr[i]) {
                socket.broadcast.to(adminArr[i].id).emit('chat message', { msg: msg.msg, fromId : socket.id, 'forId' : msg.forId });
            }
        }
    });

    socket.on('set name', function(msg) {
        io.emit('chat message', user + 'set name to ' + msg);
        user = msg;
    });

    socket.on('disconnect', function() {
console.log('current Admin users:');
console.log(adminArr);
        let i = 0,
            f = false;

        for(i = 0; i < userArr.length; i++) {
            if(userArr[i] && userArr[i].id === socket.id) {
                f = true;

                for(i = 0; i < adminArr.length; i++) {
                    if(adminArr[i]) {
                        socket.broadcast.to(adminArr[i].id).emit('chat message', { msg: 'User disconnected', disconnect : true, fromId : socket.id });
                    }
                }
                delete userArr[i];
            }
        }

        if(f === false) {
            for(i = 0; i < adminArr.length; i++) {
                if(adminArr[i] && adminArr[i].id === socket.id) {
                    f = true;
                    delete adminArr[i];
                }
            }
        }
   });
});

http.listen(port, function() {
    console.log('listening on *:' + port);
});
