const socket = io();

const room = document.querySelector('#room');
room.hidden = true;

const welcome = document.querySelector('#welcome');
const welcomeForm = welcome.querySelector('form');

let roomName;

function addMessage(msg){
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = msg;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector('#msg input');
    const value = input.value;
    socket.emit("new_message", input.value, roomName, ()=>{
        addMessage(`You: ${value}`);
    });
    input.value = "";
}
function handleNickSubmit(event){
    event.preventDefault();
    const input = room.querySelector('#name input');
    socket.emit("nickname", input.value, (nick)=>{
        const nickForm = room.querySelector('#name');
        nickForm.hidden = true;
        const nickSpan = room.querySelector('span');
        nickSpan.innerText = `Nick : ${nick}`;
    });
}

function showRoom(nick){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName}`;
    const messageForm = room.querySelector('#msg');
    const nickForm = room.querySelector('#name');
    messageForm.addEventListener('submit',handleMessageSubmit);
    nickForm.addEventListener('submit',handleNickSubmit);
    if(nick){
        nickForm.hidden = true;
        const nickSpan = room.querySelector('span');
        nickSpan.innerText = `Nickname : ${nick}`;
    }
}

function handleRoomSubmit(event){
    event.preventDefault();
    const roomInput = welcomeForm.querySelector('input:first-child');
    const nickInput = welcomeForm.querySelector('input:nth-child(2)');
    roomName = roomInput.value
    let nickname = 'Anon';
    if(nickInput.value){
        nickname = nickInput.value;
    }
    socket.emit("enter_room", roomName, nickname, showRoom);
}
welcomeForm.addEventListener('submit',handleRoomSubmit);


socket.on("welcome",(name)=>{
    addMessage(`${name} joined!`);
});
socket.on("bye",(name)=>{
    addMessage(`${name} left!`);
});
socket.on('new_message', addMessage);

function showRooms(rooms){
    const roomList = welcome.querySelector('ul');
    roomList.innerHTML = '';
    if(rooms.length === 0){
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement('li');
        li.innerText = room;
        roomList.append(li);
    });
}
socket.on('room_change', showRooms);x
socket.on('room',showRooms);