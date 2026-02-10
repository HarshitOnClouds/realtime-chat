'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getMyRooms, getMyDirectChats } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import CreateRoomModal from '@/components/modals/CreateRoomModal';
import JoinRoomModal from '@/components/modals/JoinRoomModal';
import NewDirectChatModal from '@/components/modals/NewDirectChatModal';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [directChats, setDirectChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showNewDirectChat, setShowNewDirectChat] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    try {
      const [roomsRes, chatsRes] = await Promise.all([
        getMyRooms(),
        getMyDirectChats(),
      ]);
      setRooms(roomsRes.data);
      setDirectChats(chatsRes.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleRoomCreated = (newRoom) => {
    setRooms([newRoom, ...rooms]);
    setActiveChat({ type: 'room', data: newRoom });
    setShowCreateRoom(false);
  };

  const handleRoomJoined = (room) => {
    setRooms([room, ...rooms]);
    setActiveChat({ type: 'room', data: room });
    setShowJoinRoom(false);
  };

  const handleDirectChatCreated = (chat) => {
    setDirectChats([chat, ...directChats]);
    setActiveChat({ type: 'direct', data: chat });
    setShowNewDirectChat(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar
        rooms={rooms}
        directChats={directChats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        onCreateRoom={() => setShowCreateRoom(true)}
        onJoinRoom={() => setShowJoinRoom(true)}
        onNewDirectChat={() => setShowNewDirectChat(true)}
        user={user}
      />

      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <ChatWindow activeChat={activeChat} user={user} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-white text-opacity-50">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Welcome to ChatApp</h2>
              <p>Select a chat or create a new one to get started</p>
            </div>
          </div>
        )}
      </div>

      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}

      {showJoinRoom && (
        <JoinRoomModal
          onClose={() => setShowJoinRoom(false)}
          onRoomJoined={handleRoomJoined}
        />
      )}

      {showNewDirectChat && (
        <NewDirectChatModal
          onClose={() => setShowNewDirectChat(false)}
          onChatCreated={handleDirectChatCreated}
        />
      )}
    </div>
  );
}