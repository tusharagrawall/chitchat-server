const express = require("express");
const app = express();
const PORT = 4000;

//New imports
const http = require("http").Server(app);
const cors = require("cors");

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());

let users=[];
let messages=[];

function loadMessages(from ,to, socket){
  socket.emit("chatHistory",{messages:messages?.filter(message=>(message.socketID==from &&message.to==to )||(message.socketID==to &&message.to==from )), otherPerson:to})
}
function messageResponse(from ,to, socket){
  const senderSocketID=socket.id
  console.log(messages?.filter(message=>(message.socketID==from &&message.to==to )||(message.socketID==to &&message.to==from )))
  socket.emit("chatHistory",{messages:messages?.filter(message=>(message.socketID==from &&message.to==to )||(message.socketID==to &&message.to==from )), otherPerson:to,mode:'sender'})
  socket.to(to).emit("chatHistory",{messages:messages?.filter(message=>(message.socketID==from &&message.to==to )||(message.socketID==to &&message.to==from )), otherPerson:senderSocketID})
}

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('message', (data) => {
    messages.push(data);
    messageResponse(socket.id, data.to, socket)
  });

  socket.on("openChat",(receiverId)=>{
    loadMessages(socket.id, receiverId, socket)
  })

  socket.on('newUser',(user)=>{
    users.push(user);
    socketIO.emit('newUserResponse', users);
  })

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});



app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
