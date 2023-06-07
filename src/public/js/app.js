const socket = io();

const myFace = document.getElementById('myFace');

const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
let muted = false;
let cameraOff = false;
muteBtn.addEventListener('click',()=>{
    muteBtn.innerText = muted? "Mute":"Unmute";
    muted = !muted;
});
cameraBtn.addEventListener('click',()=>{
    cameraBtn.innerText = cameraOff? "Camera Off":"Camera On";
    cameraOff = !cameraOff;
});
let myStream;
async function getMedia(){
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        myFace.srcObject = myStream;
    } catch(e){
        const error = document.getElementById('error');
        error.innerText = e;
    }
}
getMedia();