'use strict';
 
const app = angular.module('app',[]);
 
/* 
    Making factory method for socket 
*/
app.factory('socket', function ($rootScope) {
    const socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {  
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});
 
app.controller('app', function($scope,socket) {
 
    $scope.socketId = null;
    $scope.selectedUser = null;
    $scope.selectedUserName = null;
    $scope.messages = [];
    $scope.msgData = null;
    $scope.userList = [];
 
    $scope.username = window.prompt('Enter Your Name'); 

    if ($scope.username === '') {
        window.location.reload();
    }

    var TypeTimer;                
          var TypingInterval = 1000;
          var data_server;
 
          $scope.keyup = function() {
              $timeout.cancel(TypeTimer);
              TypeTimer=$timeout( function(){
                  data_server={
                      data_name:$scope.name,
                      data_val:"Socket.io"
                    }
                  socket.emit('get msg',data_server); //sending data to server
               }, TypingInterval);
          };
 
          $scope.keydown = function(){
              $timeout.cancel(TypeTimer);
          };
 
          $scope.change = function() {
              $scope.counter++;
              data_server={
                   data_name:$scope.name,
                   data_val:$scope.name+" is typing"
              }
              $timeout.cancel(TypeTimer); 
              socket.emit('get msg',data_server); //sending data to server
          };
 
          $scope.blur = function(){
              $timeout.cancel(TypeTimer);
              data_server={
                   data_name:$scope.name,
                   data_val:"Socket.io"
              }
              socket.emit('get msg',data_server); //sending data to server
          };
 
 
    $scope.selectUser = function(selectedUser) {
        selectedUser === $scope.socketId ? alert("Can't message to yourself.") : $scope.selectedUser = selectedUser.id;
        $scope.selectedUserName = selectedUser.userName;
    };
 
 
    $scope.sendMsg = function($event)  {
 
        const keyCode = $event.which || $event.keyCode; 
       
       if($scope.selectedUser == null){
            alert("Please select user to send message");
            $scope.message = null;
            return;
       }
       
        if (keyCode === 13 && $scope.message !== null) { 
           
            var item = {
                toid : $scope.selectedUser,
                msg : $scope.message,
                name : $scope.username,
                date : new Date().getTime(),
                image : 'http://dummyimage.com/250x250/000/fff&text=' + $scope.username.charAt(0).toUpperCase()
            }

            $scope.messages.push(item);
            socket.emit('getMsg',item);
            $scope.message = null;
        }       
 
    };
 
 
    socket.emit('username',$scope.username);
 
    socket.on('userList', function(userList,socketId) {
        if($scope.socketId === null){
            $scope.socketId = socketId;
        }
        $scope.userList = userList;
    });     
 
 
    socket.on('exit', function(userList) {
        $scope.userList = userList;
    });
 
    socket.on('sendMsg', function(data){
        $scope.messages.push(data);
    });
 
});