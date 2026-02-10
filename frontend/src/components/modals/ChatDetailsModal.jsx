'use client';

import { useState } from 'react';
import { leaveRoom } from '@/lib/api';

export default function ChatDetailsModal({ activeChat, onClose, onLeaveRoom, user }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isRoom = activeChat.type === 'room';
    const chatData = activeChat.data;

    // For DMs, find the other user
    const otherUser = !isRoom
        ? (chatData.senderId === user.id ? chatData.receiver : chatData.sender)
        : null;

    const handleLeaveRoom = async () => {
        if (!confirm('Are you sure you want to leave this room?')) return;

        setLoading(true);
        setError('');

        try {
            await leaveRoom(chatData.id);
            onLeaveRoom();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to leave room');
            setLoading(false);
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box bg-white text-gray-900">
                <h3 className="font-bold text-lg mb-4">
                    {isRoom ? 'Room Details' : 'User Profile'}
                </h3>

                {error && (
                    <div className="alert alert-error mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error}</span>
                    </div>
                )}

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
                                    onClick={() => navigator.clipboard.writeText(chatData.roomCode)}
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
                        <button
                            onClick={handleLeaveRoom}
                            className="btn btn-error btn-outline"
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : 'Leave Room'}
                        </button>
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
