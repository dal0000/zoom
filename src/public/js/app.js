const socket = io();

const myFace = document.getElementById('myFace');

const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');

let muted = false;
let cameraOff = false;
let myStream;
async function getCameras(){
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind ==="videoinput");
        cameras.forEach(camera =>{
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.innerText = camera.label;
            camerasSelect.appendChild(option);
        });
    } catch(e){
        console.log(e);
    }
}

async function getMedia(){
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        myFace.srcObject = myStream;
        await getCameras();
        
    } catch(e){
        console.log(e);
    }
}
getMedia();
getCameras();
muteBtn.addEventListener('click',()=>{
    muteBtn.innerText = muted? "Mute":"Unmute";
    muted = !muted;
    myStream.getAudioTracks().forEach(track => {track.enabled = !track.enabled});
});
cameraBtn.addEventListener('click',()=>{
    cameraBtn.innerText = cameraOff? "Camera Off":"Camera On";
    cameraOff = !cameraOff;
    myStream.getVideoTracks().forEach(track => {track.enabled = !track.enabled});
});