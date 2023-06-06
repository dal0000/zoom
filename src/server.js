import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get('/', (_, res) => res.render('home'));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000')

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
});

instrument(wsServer, {
    auth: false,
});

function publicRooms(){
    const {sockets:{adapter:{sids, rooms}}} = wsServer;
    const publicRooms = [];
    rooms.forEach((_,key)=>{
        if(sids.get(key) === undefined)
            publicRooms.push(key);
    });
    return publicRooms;
}
function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}
wsServer.on("connection", (socket) => {
    socket.onAny(event => {
        console.log(`Socket Event: ${event}`);
        console.log(wsServer.sockets.adapter);
    });
    socket.emit("room",publicRooms());
    socket.on("enter_room", (roomName, nickname, done) => {
        socket.join(roomName);
        socket.nickname = nickname;
        const count = countRoom(roomName)
        socket.to(roomName).emit("welcome", socket.nickname, count);
        wsServer.sockets.emit("room_change",publicRooms());
        const nick = nickname === "Anon" ? false : nickname;
        done(nick, count);
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => { socket.to(room).emit('bye', socket.nickname, countRoom(room)-1)});
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change",publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on('nickname', (nickname, done) => {
        socket["nickname"] = nickname;
        done(nickname);
    });
});


// import WebSocket from "ws";

// const wss = new WebSocket.Server({server});

// const sockets = [];
// wss.on("connection",(socket)=>{
//     sockets.push(socket);
//     console.log("Connected to Browser!✅")
//     socket.on("close",()=>console.log("Disconnected from Browser❌"));
//     socket.on("message",(message)=>{
//         sockets.forEach(aSocket =>aSocket.send(message.toString()));
//     });
// });

httpServer.listen(3000, handleListen);