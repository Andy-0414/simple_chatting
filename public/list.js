var socket = io();

var plus = document.getElementById('roomCreate_v');
var roomBox = document.getElementById('roomCreate_box');
var roomList = document.getElementById('roomList');

roomBox.style.visibility = 'hidden';
roomBox.style.opacity = 0;
roomBox.style.bottom = 0;
plus.addEventListener('click', () => {
    if (roomBox.style.visibility != 'hidden') {
        roomBox.style.visibility = "hidden";
        roomBox.style.opacity = 0;
        roomBox.style.bottom = 0;
    }
    else {
        roomBox.style.visibility = "visible";
        roomBox.style.opacity = 1;
        roomBox.style.bottom = '15vh';
    }
})

function createRoom() {
    var roomName = document.getElementById('createRoom_name').value;
    socket.emit("createRoom", { roomName: roomName });
}
socket.on('createRoom_ERROR', data => {
    alert('이미 존재하는 방입니다.');
})


socket.on('roomRenewal', data => {
    roomList.innerHTML = '';
    for (i in data.list) {
        var chatRoom = document.createElement('li');
        chatRoom.innerText = data.list[i].name;
        chatRoom.className = data.list[i].name;
        var chatUserCount = document.createElement('p');
        chatUserCount.innerText = data.list[i].user.length;
        chatRoom.appendChild(chatUserCount);
        roomList.appendChild(chatRoom);
    }
    function clickRoom(count) {
        roomList.children[count].addEventListener('click', () => {
            socket.emit('joinRoom', {
                roomName: roomList.children[count].className
            })
        })
    }
    for (var idx = 0; idx < roomList.childElementCount; idx++) {
        clickRoom(idx);
    }
})
