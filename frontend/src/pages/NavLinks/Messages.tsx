import React, { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserType {
  id: number;
  name: string;
  age: number;
  gender: string;
  department: string;
  image: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: string;
}

const Messages: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const adminId = 1;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/instructors.json")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Failed to load instructors:", err));
  }, []);

  const handleSend = () => {
    if (!inputMessage.trim() || !selectedUser) return;

    const newMessage: Message = {
      id: Date.now(),
      senderId: adminId,
      receiverId: selectedUser.id,
      text: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] bg-background rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-white py-4 shadow-md flex items-center justify-center">
        <h1 className="text-lg sm:text-xl font-semibold text-center leading-none">
          Messages
        </h1>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
        {/* Sidebar */}
        <div className="w-full sm:w-1/3 md:w-1/4 border-r border-border overflow-y-auto bg-background">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-3 cursor-pointer border-b hover:bg-muted transition ${
                selectedUser?.id === user.id ? "bg-muted/70" : ""
              } flex items-center gap-2`}
            >
              <img
                src={user.image}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <p className="font-medium">
                  {user.id === adminId ? "You" : user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.department}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-card">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="bg-muted p-4 border-b border-border flex justify-center items-center">
                <p className="font-semibold text-sm sm:text-base text-center">
                  Chat with{" "}
                  {selectedUser.id === adminId ? "You" : selectedUser.name}
                </p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages
                  .filter(
                    (msg) =>
                      (msg.senderId === adminId &&
                        msg.receiverId === selectedUser.id) ||
                      (msg.senderId === selectedUser.id &&
                        msg.receiverId === adminId)
                  )
                  .map((msg) => {
                    const sender =
                      msg.senderId === adminId
                        ? users.find((u) => u.id === adminId)
                        : selectedUser;

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end ${
                          msg.senderId === adminId
                            ? "justify-end"
                            : "justify-start"
                        } gap-2`}
                      >
                        {/* Left avatar for received messages */}
                        {msg.senderId !== adminId && sender?.image && (
                          <img
                            src={sender.image}
                            alt={sender.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}

                        <div
                          className={`p-3 rounded-lg max-w-[75%] flex flex-col ${
                            msg.senderId === adminId
                              ? "bg-gradient-to-r from-orange-600 to-orange-400 text-white items-end"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {/* Display sender name above message if received */}
                          {msg.senderId !== adminId && (
                            <p className="text-[10px] font-semibold mb-1">
                              {sender?.name}
                            </p>
                          )}
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-[10px] text-white/70 mt-1 text-right">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Right avatar for sent messages */}
                        {msg.senderId === adminId && sender?.image && (
                          <img
                            src={sender.image}
                            alt="You"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-border p-3 flex items-center gap-2 bg-background">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  className="bg-orange-500 hover:bg-orange-400 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 text-muted-foreground text-center px-4">
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
