'use client';

import { useSocket } from '@/contexts/SocketContext';

export default function MemberList({ members }) {
  const { onlineUsers } = useSocket();

  return (
    <div className="h-full p-4 overflow-y-auto">
      <h3 className="text-gray-900 font-semibold mb-4 flex items-center justify-between">
        <span>Members</span>
        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {members.length}
        </span>
      </h3>

      <div className="space-y-2">
        {members.map((member) => {
          // Check if socket online users contains this user ID
          // onlineUsers is likely a Set or Array of user IDs
          const isOnline = onlineUsers.has(member.id) || (onlineUsers instanceof Array && onlineUsers.some(u => u.id === member.id));

          return (
            <div
              key={member.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold border border-green-200">
                  {member.username[0].toUpperCase()}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  title={isOnline ? 'Online' : 'Offline'}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate text-sm">
                  {member.username}
                </p>
                <p className={`text-xs truncate ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
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