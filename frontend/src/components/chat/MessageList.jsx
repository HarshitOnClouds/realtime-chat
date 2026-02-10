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

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {Object.entries(messageGroups).map(([date, msgs]) => (
        <div key={date}>
          {/* Date Divider */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg px-4 py-1 rounded-full">
              <p className="text-white text-opacity-60 text-sm">{date}</p>
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
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
              >
                <div
                  className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-md`}
                >
                  {/* Avatar */}
                  {showAvatar && !isOwn && (
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {message.sender.username[0].toUpperCase()}
                    </div>
                  )}
                  {!showAvatar && !isOwn && <div className="w-8" />}

                  {/* Message Bubble */}
                  <div>
                    {showAvatar && !isOwn && (
                      <p className="text-white text-opacity-60 text-xs mb-1 px-3">
                        {message.sender.username}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-br-sm'
                          : 'bg-white bg-opacity-10 backdrop-blur-lg text-white rounded-bl-sm'
                      }`}
                    >
                      <p className="wrap-break-word">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-white text-opacity-70' : 'text-white text-opacity-50'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center space-x-2 px-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
          <p className="text-white text-opacity-60 text-sm">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'}{' '}
            typing...
          </p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}