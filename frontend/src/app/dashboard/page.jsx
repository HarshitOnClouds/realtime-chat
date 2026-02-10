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
import { SidebarSkeleton } from '@/components/common/Skeleton';

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
      <div className="flex h-screen bg-gray-50">
        <div className="w-full md:w-80 border-r border-gray-200 bg-white">
          <SidebarSkeleton />
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-200 bg-white`}>
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
      </div>

      <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-w-0`}>
        {activeChat ? (
          <ChatWindow
            activeChat={activeChat}
            user={user}
            onBack={() => setActiveChat(null)}
            onLeave={() => {
              setActiveChat(null);
              fetchRooms();
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Talkito</h2>
              <p className="text-gray-500">Select a chat from the sidebar or start a new conversation.</p>
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