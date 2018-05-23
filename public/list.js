var plus = document.getElementById('roomCreate_v');
var roomBox = document.getElementById('roomCreate_box');

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