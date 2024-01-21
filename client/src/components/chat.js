import React from "react";
import "./chat.css";

export const ChatDate = ({date}) => {
    return(
    <div style={{width:"100%", position: "sticky", top: "10px"}}>
        <center>
            <div className="chat-date">
                <b>{date}</b> 
            </div>
        </center>
    </div>);
}

export const Chat = ({ align, message, name, time }) => {
    return(
    <div className="chat-container">
        <div className={align==="left" ? "chat chat-left" : "chat chat-right"}>
            {align==="left" && (<h6 className="chat-header">{name}</h6>)}
            <span>{message}</span> <br/>
            <span className="chat-footer">{time}</span>
        </div>
    </div>);
}