import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoCall } from '../../components/video/VideoCall';
import { useAuth } from '../../context/AuthContext';
import { findUserById } from '../../data/users';

export const VideoCallPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isIncoming] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  if (!user || !userId) {
    return null;
  }
  
  const otherUser = findUserById(userId);
  
  if (!otherUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">The user you're trying to call doesn't exist.</p>
          <button
            onClick={() => navigate('/chat')}
            className="text-primary-600 hover:text-primary-700"
          >
            Go back to chat
          </button>
        </div>
      </div>
    );
  }
  
  const handleEndCall = () => {
    navigate(`/chat/${userId}`);
  };
  
  return (
    <VideoCall
      userId={userId}
      onEndCall={handleEndCall}
      isIncoming={isIncoming}
    />
  );
};

