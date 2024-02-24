import React, { useState, useEffect } from "react";
import { Button, TextField } from "@mui/material";
import "./App.css";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { getChats } from "../api/api.js";
import { Chat, ChatDate } from "./chat";

function App() {
  const SOCKET_URL =
    "https://chatmate-secure-and-private-messaging-hub.onrender.com";
  const localdata = localStorage.getItem("profile");
  const [ChatMessage, setChatMessage] = useState("");
  const [chats, setchats] = useState([]);
  const [username, setusername] = useState("");
  const [socket, setsocket] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (localdata) {
          setusername(JSON.parse(localdata).result.username);
          const Chats = await getChats();
          if (Chats.status === 200) {
            setchats(Chats.data);
            const element = document.querySelector(".chatbox");
            setTimeout(() => {
              element.scrollTop = element.scrollHeight;
            }, 10);
            await setsocket(
              io
                .connect(SOCKET_URL)
                .emit("join_room", "chatting")
                .on("recieve_message", (data) => {
                  if (data.error === "jwt expired") {
                    alert("Session expired !!");
                    navigate("/auth");
                    localStorage.removeItem("profile");
                  } else if (!data.error) {
                    setchats((chats) => [...chats, data]);
                    setTimeout(() => {
                      element.scrollTop = element.scrollHeight;
                    }, 1);
                  } else {
                    alert(data.error);
                  }
                })
            );
          } else if (Chats.status === 201) {
            if (Chats.data === "jwt expired") alert("Session expired !!");
            navigate("/auth");
            localStorage.removeItem("profile");
          }
        } else {
          navigate("/auth");
        }
      } catch (error) {
        alert("SERVER DOWN!");
        console.log(error.message);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setChatMessage(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    document.getElementById("input").value = "";
    try {
      await socket.emit("send_message", {
        Name: username,
        message: ChatMessage,
        headers: { authorization: `Bearer ${JSON.parse(localdata).token}` },
      });
    } catch (error) {
      alert("Connection lost!!");
      console.log(error);
    }
    //const element = document.querySelector('.chatbox');
    //element.scrollTop = element.scrollHeight+54;
  };
  const handleLogout = async (e) => {
    await socket.disconnect();
    navigate("/auth");
    localStorage.removeItem("profile");
  };

  return (
    <>
      <div className="User">
        <div className="icon">{username[0]}</div>
        <div className="name">
          <b>{username}</b>
        </div>
        <Button variant="contained" color="primary" onClick={handleLogout}>
          LogOut
        </Button>
      </div>
      <div className="container">
        <div className="chatbox">
          {(() => {
            let p = [];
            let prevdate = "";
            for (let element of chats) {
              const timestamp = new Date(element.date);
              const date = timestamp.toString().slice(4, 15);
              const hours = timestamp.getHours();
              const minutes =
                timestamp.getMinutes() > 9
                  ? timestamp.getMinutes().toString()
                  : "0" + timestamp.getMinutes().toString();
              const time =
                hours > 12
                  ? (hours - 12).toString() + ":" + minutes + "pm"
                  : (hours === 0 ? "12" : hours.toString()) +
                    ":" +
                    minutes +
                    "am";

              if (prevdate !== date) p.push(<ChatDate date={date} />);
              p.push(
                <Chat
                  align={element.Name === username ? "right" : "left"}
                  name={element.Name}
                  message={element.message}
                  time={time}
                />
              );
              prevdate = date;
            }
            return p;
          })()}
        </div>
        <form onSubmit={handleSubmit} className="chat-bar">
          <TextField
            id="input"
            variant="outlined"
            placeholder="type something..."
            label="Chat"
            multiline
            maxRows="2"
            required
            onChange={handleChange}
          >
            {" "}
          </TextField>
          <button
            className="send"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#0b0d7a";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "blue";
            }}
            required
            type="submit"
          >
            {" "}
            Send:){" "}
          </button>
        </form>
      </div>
    </>
  );
}

export default App;
