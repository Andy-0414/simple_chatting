var socket = io();

var plus = document.getElementById('roomCreate_v');
var roomBox = document.getElementById('roomCreate_box');
var roomList = document.getElementById('roomList');
var roomName = document.getElementById('roomName');
var create_roomName = document.getElementById('createRoom_name');
var chatInput = document.getElementById('chatInput');
var inChat = document.getElementById('inChat');
var inUserList = document.getElementById('inUserList');

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
    roomBox.style.visibility = "hidden";
    roomBox.style.opacity = 0;
    roomBox.style.bottom = 0;
    var roomName = create_roomName.value;
    create_roomName.value = '';
    socket.emit("createRoom", { roomName: roomName });

}
socket.on('createRoom_ERROR', data => {
    alert('이미 존재하는 방입니다.');
})

socket.on('roomRenewal', data => {
    roomList.innerHTML = '';
    for (i in data.list) {
        var chatRoom = document.createElement('li');
        chatRoom.innerText = data.list[i].roomName;
        chatRoom.className = data.list[i].roomName;
        var chatUserCount = document.createElement('p');
        chatUserCount.innerText = data.count[i];
        chatRoom.appendChild(chatUserCount)
        roomList.appendChild(chatRoom);
    }
    function clickRoom(count) {
        roomList.children[count].addEventListener('click', () => {
            var name = roomList.children[count].className
            socket.emit('joinRoom', {
                roomName: name
            });
            roomName.innerText = name;
            inChat.innerHTML = '';

        })
    }
    for (var idx = 0; idx < roomList.childElementCount; idx++) {
        clickRoom(idx);
    }
})

socket.on('change', data => {

})

function sendServer() {
    socket.emit('reqMsg', {
        msg: chatInput.value
    })
    chatInput.value = '';
}

socket.on('resMsg', data => {
    // msg , image, username
    // <p>
    //     <img src="https://phinf.pstatic.net/contact/profile/blog/86/83/pjh8667.jpg" alt="profile" width="25"> Andy0414 : Hello user
    //</p>
    var chatBar = document.createElement('p');
    var img = document.createElement('img');
    var m = document.createTextNode(" " + data.user.username + " : " + data.msg);
    img.src = data.user.image;
    img.alt = 'img';
    img.width = 25;
    chatBar.appendChild(img);
    chatBar.appendChild(m);
    inChat.appendChild(chatBar);
    inChat.scrollTop = inChat.scrollHeight - inChat.clientHeight;
})