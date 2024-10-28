"use client";

import { useEffect, useState,useMemo } from "react";
import { io } from "socket.io-client";

const App:React.FC = () => {
  const [message,setMessage]=useState<string>()
  const socket = useMemo(()=>io("http://localhost:3001"),[]);

  const handleSubmit =(e: React.MouseEvent<HTMLButtonElement>)=>{
    e.preventDefault();
    socket.emit("message",message)
    setMessage("")
  }
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected",socket.id);
    });
     socket.on("meesage",(data)=>{
      console.log("data",data)
     })
     socket.on("receive-message",(data)=>{
       console.log("data",data)
     })
    return ()=>{
      socket.disconnect()
    }
  }, []);

  return <div>
    <div>
      Welcome to Socket.io
    </div>
    <input type="text"  value ={message}  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}/>
    <button type="submit" onClick={handleSubmit}>Submit</button>
  </div>;
};

export default App;
