'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar({
  rooms,
  directChats,
  activeChat,
  setActiveChat,
  onCreateRoom,
  onJoinRoom,
  onNewDirectChat,
  user,
}) {
  const { logoutUser } = useAuth();

  return (
    <div className="w-80 bg-white bg-opacity-5 backdrop-blur-lg border-r border-white border-opacity-20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white border-opacity-20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">ChatApp</h1>
          <button
            onClick={logoutUser}
            className="px-3 py-1 bg-red-500 bg-opacity-20 text-white rounded hover:bg-opacity-30 transition-all text-sm"
          >
            Logout
          </button>
        </div>
        
        <div className="flex items-center space-x-3 p-2 bg-white bg-opacity-5 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium">{user.username}</p>
            <p className="text-xs text-white text-opacity-60">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        <button
          onClick={onCreateRoom}
          className="w-full py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          + Create Room
        </button>
        <button
          onClick={onJoinRoom}
          className="w-full py-2 bg-white bg-opacity-10 text-white rounded-lg font-semibold hover:bg-opacity-20 transition-all"
        >
          Join Room
        </button>
        <button
          onClick={onNewDirectChat}
          className="w-full py-2 bg-white bg-opacity-10 text-white rounded-lg font-semibold hover:bg-opacity-20 transition-all"
        >
          + New Direct Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {/* Rooms Section */}
        {rooms.length > 0 && (
          <div className="px-4 py-2">
            <h3 className="text-white text-opacity-60 text-sm font-semibold mb-2">
              ROOMS
            </h3>
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setActiveChat({ type: 'room', data: room })}
                className={`w-full p-3 rounded-lg mb-2 text-left transition-all ${
                  activeChat?.type === 'room' && activeChat?.data?.id === room.id
                    ? 'bg-white bg-opacity-20'
                    : 'bg-white bg-opacity-5 hover:bg-opacity-10'
                }`}
              >
                <p className="text-white font-medium">{room.name}</p>
                <p className="text-xs text-white text-opacity-60">
                  {room.members.length} members
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Direct Chats Section */}
        {directChats.length > 0 && (
          <div className="px-4 py-2">
            <h3 className="text-white text-opacity-60 text-sm font-semibold mb-2">
              DIRECT MESSAGES
            </h3>
            {directChats.map((chat) => {
              const otherUser =
                chat.senderId === user.id ? chat.receiver : chat.sender;
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat({ type: 'direct', data: chat })}
                  className={`w-full p-3 rounded-lg mb-2 text-left transition-all ${
                    activeChat?.type === 'direct' &&
                    activeChat?.data?.id === chat.id
                      ? 'bg-white bg-opacity-20'
                      : 'bg-white bg-opacity-5 hover:bg-opacity-10'
                  }`}
                >
                  <p className="text-white font-medium">{otherUser.username}</p>
                  <p className="text-xs text-white text-opacity-60">
                    {otherUser.email}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}