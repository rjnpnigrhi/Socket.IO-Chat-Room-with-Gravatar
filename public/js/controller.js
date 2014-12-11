app.controller('mainController', function($scope, $rootScope, $routeParams, $location){

});

app.controller('CreateRoomController', function($scope, $routeParams, $location) {
    $scope.roomId = $routeParams.roomid;
    $scope.createRoom = function(emailId, name){
        if(!validateEmail(emailId)){
            alertMsg('Email Id not valid!');
            return;
        }else if(!name){
            alertMsg('Please enter your name!');
            return;
        }

        if($routeParams.roomid){
            // Join Chat Room
            socket.emit("join-room", { email: emailId, name: name, roomid: $scope.roomId });
        }else {
            // Create Chat Room
            socket.emit("create-room", { email: emailId, name: name });
        }
    }

    socket.on('room-created', function (data) {
        alertMsg('Your chat room has been created. Now you can share the chat room link!');
        window.location.href = '/#/chat-room/' + data.roomid + '/' + data.userid;
    });

    socket.on('room-joined', function (data) {
        alertMsg('You have joined the chat room successfully!');
        window.location.href = '/#/chat-room/' + data.roomid + '/' + data.userid;
    });

    socket.on('room-not-found', function () {
        alertMsg('Chat Room not found!');
        window.location.href = '/';
    });
});

app.controller('ChatRoomController', function($scope, $rootScope, $routeParams, $location) {
    if(!$routeParams.roomid || !$routeParams.userid){
        window.location.href = '/';
    }

    $scope.roomId = $routeParams.roomid;
    $scope.userId = $routeParams.userid;
    $scope.roomDetails = {};
    $scope.currentUser = {};

    socket.emit('get-room-details', { roomid: $scope.roomId, userid: $scope.userId });

    socket.on('room-details', function (roomDetails) {
        console.log(roomDetails);
        $rootScope.navBarText = 'Chat Room Link (Shareable): ' + url + '#/' + roomDetails.roomId;
        $rootScope.$apply();

        $scope.roomDetails = roomDetails;
        $scope.$apply();

        for(var u = 0; u < roomDetails.users.length; u++){
            if(roomDetails.users[u].userId == $scope.userId){
                $scope.currentUser = roomDetails.users[u];
            }
        }
    });

    socket.on('user-joined', function (users) {
        if($scope.roomDetails.users){
            $scope.roomDetails.users = users;
            $scope.$apply();
        }
    });

    socket.on('room-details-error', function () {
        window.location.href = '/';
    });

    $scope.sendMessage = function(userMessage) {
        socket.emit('room-message', { roomid: $scope.roomDetails.roomId, user: $scope.currentUser, message: userMessage });
        $scope.userMessage = '';
    }

    socket.on('room-message', function(data) {
        $scope.roomDetails.messages.push(data);
        $scope.$apply();
    });
});