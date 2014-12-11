var app = angular.module('app', ['ngRoute']);
var socket = io();
var url = window.location.protocol + "//" + window.location.host + "/"; //+ window.location.pathname;

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/create-room.html',
                controller: 'CreateRoomController'
            }).
            when('/:roomid', {
                templateUrl: 'partials/create-room.html',
                controller: 'CreateRoomController'
            }).
            when('/chat-room/:roomid/:userid', {
                templateUrl: 'partials/chat-room.html',
                controller: 'ChatRoomController'
            }).
            otherwise({
                redirectTo: '/'
            });
    }]);