'use client';

import { useSocket } from '@/contexts/SocketContext';

export default function MemberList({ members }) {
  const { onlineUsers } = useSocket();

  return (
    <div className="w-64 bg-white bg-opacity-5 backdrop-blur-lg border-l border-white border-opacity-20 p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center justify-between">
        <span>Members</span>
        <span className="text-sm bg-white bg-opacity-10 px-2 py-1 rounded-full">
          {members.length}
        </span>
      </h3>

      <div className="space-y-2">
        {members.map((member) => {
          const isOnline = onlineUsers.has(member.id);

          return (
            <div
              key={member.id}
              className="flex items-center space-x-3 p-2 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 transition-all"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                  {member.username[0].toUpperCase()}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    isOnline ? 'bg-green-400' : 'bg-gray-400'
                  }`}
                  title={isOnline ? 'Online' : 'Offline'}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {member.username}
                </p>
                <p className="text-xs text-white text-opacity-50 truncate">
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}