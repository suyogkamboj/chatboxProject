import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [msgCnt, setMsgCnt] = useState(0);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        id: Math.random(),
        room: room,
        author: username,
        message: currentMessage,
        like: 0,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      const list = messageList;
      list.push(messageData);
      setMessageList(list);
      setCurrentMessage("");

      await socket.emit("send_message", messageData);
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      const list = messageList;
      let isExst = false;
      for (const mssg of list) {
        if (mssg.id === data.id) {
          isExst = true;
          mssg.like = (mssg.like !== data.like) ? data.like : mssg.like;
        }
      }
      if (!isExst) {
        setMsgCnt(msgCnt => msgCnt++);
        list.push(data);
      }
      setMessageList([...list]);
    });
  }, [msgCnt]);

  const applyLike = msg => {
    // msg.like = (msg.like === undefined) ? 1 : msg.like++;
    const list = messageList;
    for (const mssg of list) {
      if (mssg.id === msg.id) {
        mssg.like++;
        msg = mssg;
      }
    }
    setMessageList(JSON.parse(JSON.stringify(list)));

    socket.emit("send_message", msg);
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                    <button onClick={() => applyLike(messageContent)}>Like {messageContent.like}</button>
                  </div>

                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Write Message ...."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;