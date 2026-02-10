'use client';

import { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MemberList from './MemberList';
import socketService from '@/lib/socket';
import { getRoomMessages, getDirectChatMessages } from '@/lib/api';

export default function ChatWindow({ activeChat, user }) {
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showMembers, setShowMembers] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeChat) return;

    setLoading(true);
    setMessages([]);
    setMembers([]);
    setTypingUsers([]);

    // Fetch messages
    const fetchMessages = async () => {
      try {
        let response;
        if (activeChat.type === 'room') {
          response = await getRoomMessages(activeChat.data.id);
          socketService.joinRoom(activeChat.data.id, user.id);
        } else {
          response = await getDirectChatMessages(activeChat.data.id);
          socketService.joinDirectChat(activeChat.data.id, user.id);
        }
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Socket listeners
    socketService.onReceiveMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketService.onRoomMembers((data) => {
      if (activeChat.type === 'room' && data.roomId === activeChat.data.id) {
        setMembers(data.members);
      }
    });

    socketService.onUserTyping((data) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
      }, 3000);
    });

    socketService.onUserStoppedTyping((data) => {
      setTypingUsers((prev) => prev.filter((u) => u !== data.userId));
    });

    return () => {
      socketService.offReceiveMessage();
      socketService.offUserTyping();
      socketService.offUserStoppedTyping();
    };
  }, [activeChat, user.id]);

  const handleSendMessage = (content) => {
    if (activeChat.type === 'room') {
      socketService.sendRoomMessage(activeChat.data.id, content, user.id);
    } else {
      const receiverId =
        activeChat.data.senderId === user.id
          ? activeChat.data.receiverId
          : activeChat.data.senderId;
      socketService.sendDirectMessage(
        activeChat.data.id,
        content,
        user.id,
        receiverId
      );
    }
  };

  const getTitle = () => {
    if (activeChat.type === 'room') {
      return activeChat.data.name;
    } else {
      const otherUser =
        activeChat.data.senderId === user.id
          ? activeChat.data.receiver
          : activeChat.data.sender;
      return otherUser.username;
    }
  };

  const getChatMembers = () => {
    if (activeChat.type === 'room') {
      return members.length > 0 ? members : activeChat.data.members.map(m => m.user);
    } else {
      const otherUser =
        activeChat.data.senderId === user.id
          ? activeChat.data.receiver
          : activeChat.data.sender;
      return [user, otherUser];
    }
  };

  const copyRoomCode = () => {
    if (activeChat.type === 'room') {
      navigator.clipboard.writeText(activeChat.data.roomCode);
      alert('Room code copied to clipboard!');
    }
  };

  return (
    <div className="flex-1 flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg border-b border-white border-opacity-20 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
            {activeChat.type === 'room' && (
              <button
                onClick={copyRoomCode}
                className="text-sm text-white text-opacity-60 hover:text-opacity-100 transition-all flex items-center space-x-1"
              >
                <span>Room Code: {activeChat.data.roomCode}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all flex items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>{showMembers ? 'Hide' : 'Show'} Members</span>
          </button>
        </div>

        {/* Messages */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white text-opacity-60">Loading messages...</div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={user.id}
            typingUsers={typingUsers}
          />
        )}

        {/* Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          roomId={activeChat.type === 'room' ? activeChat.data.id : null}
          chatId={activeChat.type === 'direct' ? activeChat.data.id : null}
          userId={user.id}
          username={user.username}
        />
      </div>

      {/* Member List */}
      {showMembers && <MemberList members={getChatMembers()} />}
    </div>
  );
}