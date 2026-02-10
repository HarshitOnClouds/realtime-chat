'use client';

import { useState } from 'react';
import { joinRoom } from '@/lib/api';

export default function JoinRoomModal({ onClose, onRoomJoined }) {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await joinRoom({ roomCode: roomCode.toUpperCase() });
      onRoomJoined(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-white text-gray-900">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Join Room</h3>

        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Room Code</span>
            </label>
            <input
              type="text"
              placeholder="Enter 8-character room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="input input-bordered w-full text-center uppercase tracking-widest font-mono text-lg bg-white border-gray-300 text-gray-900 focus:input-success focus:border-green-500"
              required
              maxLength={8}
              autoFocus
            />
          </div>

          <div className="mt-4 p-4 bg-green-50 text-green-900 rounded-lg text-sm border border-green-100">
            <p className="flex items-start gap-2">
              <span>💡</span>
              <span>Get the room code from someone who has already created or joined the room.</span>
            </p>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || roomCode.length !== 8}
              className="btn btn-success text-white hover:bg-green-700 border-none"
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Join Room'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
