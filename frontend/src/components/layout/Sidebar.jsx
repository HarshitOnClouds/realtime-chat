'use client';

import { useState } from 'react';
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="w-full bg-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-green-600 tracking-tight">Talkito</h1>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
          >
            Logout
          </button>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold border border-green-200">
            {user.username[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-gray-900 font-medium truncate">{user.username}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        <button
          onClick={onCreateRoom}
          className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Room</span>
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onJoinRoom}
            className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Join Room
          </button>
          <button
            onClick={onNewDirectChat}
            className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            New DM
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-6">
        {/* Rooms Section */}
        {rooms.length >= 0 && (
          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
              Rooms ({rooms.length})
            </h3>
            <div className="space-y-0.5">
              {rooms.length === 0 && <p className="px-4 text-sm text-gray-400 italic">No rooms yet</p>}
              {rooms.map((room) => {
                const isActive = activeChat?.type === 'room' && activeChat?.data?.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveChat({ type: 'room', data: room })}
                    className={`w-full px-4 py-2.5 rounded-lg text-left transition-colors flex items-center space-x-3 group ${isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <span className={`flex-shrink-0 w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300 group-hover:bg-gray-400'}`}></span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate text-sm ${isActive ? 'text-green-900' : 'text-gray-900'}`}>{room.name}</p>
                      <p className={`text-xs truncate ${isActive ? 'text-green-500' : 'text-gray-500'}`}>
                        {room.members.length} members
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Direct Chats Section */}
        {directChats.length >= 0 && (
          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Direct Messages ({directChats.length})
            </h3>
            <div className="space-y-0.5">
              {directChats.length === 0 && <p className="px-4 text-sm text-gray-400 italic">No messages yet</p>}
              {directChats.map((chat) => {
                const otherUser =
                  chat.senderId === user.id ? chat.receiver : chat.sender;
                const isActive = activeChat?.type === 'direct' && activeChat?.data?.id === chat.id;

                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChat({ type: 'direct', data: chat })}
                    className={`w-full px-4 py-2.5 rounded-lg text-left transition-colors flex items-center space-x-3 group ${isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${isActive ? 'bg-green-200 text-green-700 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {otherUser.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate text-sm ${isActive ? 'text-green-900' : 'text-gray-900'}`}>{otherUser.username}</p>
                      <p className={`text-xs truncate ${isActive ? 'text-green-500' : 'text-gray-500'}`}>
                        {otherUser.email}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showLogoutModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white text-gray-900">
            <h3 className="font-bold text-lg">Confirm Logout</h3>
            <p className="py-4">Are you sure you want to log out of your account?</p>
            <div className="modal-action">
              <button
                className="btn btn-ghost text-gray-600 hover:bg-gray-100"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error text-white"
                onClick={() => {
                  logoutUser();
                  setShowLogoutModal(false);
                }}
              >
                Logout
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowLogoutModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
