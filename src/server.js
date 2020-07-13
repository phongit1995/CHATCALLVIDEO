require("dotenv").config();
const express = require("express");
const path = require("path");
const https = require("https");
const http = require("http");
const fs= require("fs");
let listUser= [];
const serverConfig = {
    key: fs.readFileSync(path.join(__dirname,'./key.pem')),
    cert: fs.readFileSync(path.join(__dirname,'./cert.pem')),
};
const app = express();
app.use(express.static(path.join(__dirname, './../public')))
// var server = https.createServer(serverConfig,app);
var server =http.createServer(app) ;
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"../public/index.html"));
})
server.listen(process.env.PORT||3000,()=>{
    console.log("App Run On : https://localhost:" +process.env.PORT||3000 );
})
var io = require('socket.io').listen(server);
let allUsers = [];
var users = {};
io.on("connection",(socket)=>{
    socket.on("message",(message)=>{
        var data;
        try {
            data = JSON.parse(message);
        } catch (error) {
            console.log("Invalid JSON"); 
            data = {}; 
        }
        switch (data.type) {
            case "login":
                if(users[data.name]) { 
                    io.to(socket.id).emit("message",{ 
                        type: "login", 
                        success: false 
                     })
                 }
                 else {
                    console.log('save user connection on the server') ;
                    users[data.name] = socket.id; 
                    socket.name= data.name ;
                    allUsers.indexOf(data.name) === -1 ? allUsers.push(data.name) : console.log("This item already exists");
                    socket.emit("message",{ 
                        type: "login", 
                        success: true,
                        allUsers:allUsers
                     })
                 }
                break;
            case "offer":
                console.log("Sending offer to: ", data.name);
                var conn = users[data.name];
                if(conn) {
                    socket.otherName = data.name ;
                    io.to(conn).emit("message",{
                        type:"offer",
                        offer:data.offer,
                        name:socket.name
                    })
                }
                break ;
            case "answer":
                console.log("Sending answer to: ", data.name); 
                var conn = users[data.name];
                if(conn){
                    socket.otherName = data.name ;
                    io.to(conn).emit("message",{
                        type: "answer", 
                        answer: data.answer 
                    })
                }
                break ;
            case "candidate": 
            var conn = users[data.name];
            if(conn){
                socket.otherName = data.name ;
                io.to(conn).emit("message",{
                    type: "candidate", 
                    candidate: data.candidate 
                })
            }
            default:
                break;
        }
    })
    socket.on("disconnect",()=>{
        delete users[socket.name];
        allUsers = allUsers.filter(function(item) {
            return item !== socket.name
        })
    })
})
