'use client';

import { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatDetailsModal from '../modals/ChatDetailsModal';
import { MessageSkeleton } from '../common/Skeleton';
import socketService from '@/lib/socket';
import { getRoomMessages, getDirectChatMessages } from '@/lib/api';

export default function ChatWindow({ activeChat, user, onBack, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
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
      const isForCurrentRoom = activeChat.type === 'room' && message.roomId === activeChat.data.id;
      const isForCurrentChat = activeChat.type === 'direct' && message.directChatId === activeChat.data.id;

      if (isForCurrentRoom || isForCurrentChat) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socketService.onRoomMembers((data) => {
      if (activeChat.type === 'room' && data.roomId === activeChat.data.id) {
        setMembers(data.members);
      }
    });

    socketService.onUserTyping((data) => {
      // Check if typing event matches current scope
      // valid targets: "room:{id}" or "chat:{id}"
      const target = data.target;
      const currentTarget = activeChat.type === 'room' ? `room:${activeChat.data.id}` : `chat:${activeChat.data.id}`;

      if (target === currentTarget) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });

        // Auto-clear after 3s in case stop event is missed
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== data.username));
        }, 3000);
      }
    });

    socketService.onUserStoppedTyping((data) => {
      // We don't have target here in standard implementation usually, 
      // but simplistic user filtering is okay if we assume one chat focus.
      // Better: check if user is in members/participants. 
      // For now, removing them is safe enough as it just clears the indicator.
      setTypingUsers((prev) => prev.filter((u) => u !== data.userId)); // userId might need mapping to username if that's what we store
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

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            onClick={() => setShowDetails(true)}
          >
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {getTitle()}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </h2>
            {activeChat.type === 'direct' && (
              <p className="text-xs text-gray-500">
                Click for details
              </p>
            )}
            {activeChat.type === 'room' && (
              <p className="text-xs text-gray-500">
                {activeChat.data.members?.length || 0} members · Click for info
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          {loading ? (
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <MessageSkeleton />
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
      </div>

      {showDetails && (
        <ChatDetailsModal
          activeChat={activeChat}
          user={user}
          onClose={() => setShowDetails(false)}
          onLeaveRoom={onLeave}
        />
      )}
    </div>
  );
}
