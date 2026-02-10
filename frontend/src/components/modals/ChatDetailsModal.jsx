'use client';

import { useState } from 'react';
import { leaveRoom, deleteRoom } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export default function ChatDetailsModal({ activeChat, onClose, onLeaveRoom, user }) {
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const isRoom = activeChat.type === 'room';
    const chatData = activeChat.data;

    // For DMs, find the other user
    const otherUser = !isRoom
        ? (chatData.senderId === user.id ? chatData.receiver : chatData.sender)
        : null;

    const handleLeaveRoom = async () => {
        if (!confirm('Are you sure you want to leave this room?')) return;

        setLoading(true);
        setLoading(true);

        try {
            await leaveRoom(chatData.id);
            addToast('Left room successfully', 'success');
            onLeaveRoom();
            onClose();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to leave room', 'error');
            setLoading(false);
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box bg-white text-gray-900">
                <h3 className="font-bold text-lg mb-4">
                    {isRoom ? 'Room Details' : 'User Profile'}
                </h3>


                {isRoom ? (
                    <div className="space-y-4">
                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Room Name</span>
                            </label>
                            <div className="text-gray-700">{chatData.name}</div>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Room Code</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-lg">{chatData.roomCode}</code>
                                <button
                                    className="btn btn-xs btn-ghost text-green-600 hover:bg-green-50"
                                    onClick={() => {
                                        navigator.clipboard.writeText(chatData.roomCode);
                                        addToast('Room code copied', 'success');
                                    }}
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Members ({chatData.members?.length || 0})</span>
                            </label>
                            <div className="max-h-48 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-2">
                                {chatData.members?.map((member) => (
                                    <div key={member.user.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded transition-colors">
                                        <div className="avatar placeholder">
                                            <div className="bg-green-100 text-green-700 rounded-full w-8 border border-green-200 flex items-center justify-center">
                                                <span className="text-xs">{member.user.username[0].toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{member.user.username}</div>
                                            <div className="text-xs text-gray-500">{member.user.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center py-4">
                            <div className="avatar placeholder mb-4">
                                <div className="bg-green-100 text-green-700 rounded-full w-24 border-2 border-green-200 flex items-center justify-center">
                                    <span className="text-3xl">{otherUser.username[0].toUpperCase()}</span>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold">{otherUser.username}</h4>
                            <p className="text-gray-500">{otherUser.email}</p>
                        </div>
                    </div>
                )}

                <div className="modal-action justify-between">
                    {isRoom ? (
                        <div className="flex gap-2">
                            {user.id === chatData.createdById && (
                                <button
                                    onClick={async () => {
                                        if (!confirm('Are you sure you want to DELETE this room? This action cannot be undone.')) return;
                                        setLoading(true);
                                        try {
                                            await deleteRoom(chatData.id);
                                            addToast('Room deleted successfully', 'success');
                                            onLeaveRoom(); // Using onLeaveRoom to trigger refresh and close chat
                                            onClose();
                                        } catch (err) {
                                            addToast(err.response?.data?.error || 'Failed to delete room', 'error');
                                            setLoading(false);
                                        }
                                    }}
                                    className="btn btn-error text-white"
                                    disabled={loading}
                                >
                                    {loading ? <span className="loading loading-spinner"></span> : 'Delete Room'}
                                </button>
                            )}
                            <button
                                onClick={handleLeaveRoom}
                                className="btn btn-error btn-outline"
                                disabled={loading}
                            >
                                {loading ? <span className="loading loading-spinner"></span> : 'Leave Room'}
                            </button>
                        </div>
                    ) : <div></div>}

                    <button className="btn btn-ghost text-gray-600 hover:bg-gray-100" onClick={onClose}>Close</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}
