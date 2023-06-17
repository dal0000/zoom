const socket = io();

const myFace = document.getElementById('myFace');

const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');
const call = document.getElementById('call');

call.hidden = true;

let muted = false;
let cameraOff = false;
let roomName;
let myStream;
let peerConnection;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        });
    } catch (e) {
        console.log(e);
    }
}

async function getMedia(cameraId) {

    const initialConstrains = {
        audio: true,
        video: { facingMode: "user" }
    };
    const newConstrains = {
        audio: true,
        video: { deviceId: { exact: cameraId } }
    };
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const videoExist = cameras.length === 0 ? false : true;
        const noVideoConstrains = {
            audio: true
        }
        myStream = await navigator.mediaDevices.getUserMedia(
            videoExist ? (cameraId ? newConstrains : initialConstrains) : noVideoConstrains
        );
        myFace.srcObject = myStream;
        if (!cameraId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}

muteBtn.addEventListener('click', () => {
    muteBtn.innerText = muted ? "Mute" : "Unmute";
    muted = !muted;
    myStream.getAudioTracks().forEach(track => { track.enabled = !track.enabled });
});
cameraBtn.addEventListener('click', () => {
    cameraBtn.innerText = cameraOff ? "Camera Off" : "Camera On";
    cameraOff = !cameraOff;
    myStream.getVideoTracks().forEach(track => { track.enabled = !track.enabled });
});

async function handleCameraChange() {
    const cameraId = camerasSelect.value;
    await getMedia(cameraId);
}
camerasSelect.addEventListener('input', handleCameraChange);

// welcome and enter room

const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form');

async function startMedia() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}
welcomeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = welcomeForm.querySelector('input');
    await startMedia();
    socket.emit("join_rooom", input.value);
    roomName = input.value;
});

// socket

socket.on("welcome", async () => { //brave
    const offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
    console.log("Sent the offer")
});
socket.on("offer", async offer => {  //chrome
    peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    peerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("Recieved the offer", "Sent the answer");
});
socket.on('answer',answer=>{
    peerConnection.setRemoteDescription(answer); //brave
    console.log("Received the answer");
});
socket.on("ice",ice => {
    peerConnection.addIceCandidate(ice);
    console.log("Received candidate");
});

//RTC code
function makeConnection() {
    peerConnection = new RTCPeerConnection(); 
    peerConnection.addEventListener("icecandidate",handleIce);
    peerConnection.addEventListener("addstream",handleAddStream);
    myStream
        .getTracks()
        .forEach(track => peerConnection.addTrack(track, myStream));
}

function handleIce(data){
    console.log('Sent candidate');
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data){
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}