'use client';

import { useEffect, useRef } from 'react';

export default function MessageList({ messages, currentUserId, typingUsers }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No messages yet</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Start the conversation by sending a message below!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
      {Object.entries(messageGroups).map(([date, msgs]) => (
        <div key={date}>
          {/* Date Divider */}
          <div className="flex items-center justify-center my-6">
            <div className="bg-gray-200 px-3 py-1 rounded-full">
              <p className="text-gray-600 text-xs font-medium">{date}</p>
            </div>
          </div>

          {/* Messages */}
          {msgs.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const showAvatar =
              index === 0 ||
              msgs[index - 1].senderId !== message.senderId;

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}
              >
                <div
                  className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xl`}
                >
                  {/* Avatar */}
                  {showAvatar && !isOwn && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold shrink-0 border border-green-200">
                      {message.sender.username[0].toUpperCase()}
                    </div>
                  )}
                  {!showAvatar && !isOwn && <div className="w-8" />}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    {showAvatar && !isOwn && (
                      <span className="text-xs text-gray-500 ml-1 mb-1">
                        {message.sender.username}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${isOwn
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                        }`}
                    >
                      <p className="break-words leading-relaxed">{message.content}</p>
                    </div>
                    <span
                      className={`text-[10px] mt-1 px-1 ${isOwn ? 'text-gray-400' : 'text-gray-400'
                        }`}
                    >
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center space-x-2 px-3 pt-2">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
          <p className="text-gray-500 text-xs italic">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'}{' '}
            typing...
          </p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
