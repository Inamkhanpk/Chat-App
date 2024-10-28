import express from "express"
import {Server} from "socket.io"
import {createServer} from  "http"
import cors from "cors"
const port= 3001;
const app = express();
const server = new createServer(app);
app.use(cors())
const io = new Server(server,{
    cors:{
origin : "http://localhost:3000",
methods:["GET","POST"],
credential:true
    }
})

app.get("/",(req,res)=>{
    res.send("Hello World")
})

io.on("connection",(socket)=>{
  console.log("User connected",socket.id);
  socket.on("message",(data)=>{
   console.log(data);
   socket.broadcast.emit("receive-message",data)
  })
  socket.on("disconnect",()=>{
    console.log("UserDisconnected",socket.id)
  })
})
server.listen(port,()=>{
    console.log(`Server is running 0n ${port}`)
})