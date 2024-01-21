import express from "express";
import {Server} from "socket.io";
import http from"http";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes/routes.js"
import chatMessage from "./models/chat.js";
import jwt from "jsonwebtoken";

const CONNECTION_URL="mongodb+srv://chatApp:chatApp123@cluster0.xp0ygrr.mongodb.net/?retryWrites=true&w=majority";
const PORT=5000;
const app = express();
app.use(cors());
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use("/",routes);

const server = http.createServer(app);
const io = new Server (server, {
    cors:{
        methods: ["GET","POST"],
    },
});
io.on("connection", (socket) => {
    console.log(`USER Connected: ${socket.id}`);
    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });
    socket.on("send_message", async (data) => {
        try {
            const token = data.headers.authorization;
            if(token){
                const decodedData = jwt.verify(token.split(" ")[1], "test");
                data.userId = decodedData?.id;
            }
            if(!data.userId) socket.emit("recieve_message",{message: "Unauthenticated"});
            else{
                data.date = new Date();
                const newchatmessage = new chatMessage(data);
                await newchatmessage.save();
                socket.nsp.to('chatting').emit("recieve_message",data);
            }
        }catch (error) {
            socket.emit("recieve_message",{"error":error.message});
            console.log(error.message);
        }
    });
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => server.listen(PORT, ()=> console.log("[+] server running at port 5000")))
    .catch((error) => console.log(error));


