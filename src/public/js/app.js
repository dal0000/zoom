const socket = io();

const myFace = document.getElementById('myFace');

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
        error.innerText = navigator.mediaDevices;
    }
}
getMedia();