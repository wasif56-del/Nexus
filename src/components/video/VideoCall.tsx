import React, { useState, useRef, useEffect } from 'react';
import { Phone, Video, VideoOff, Mic, MicOff, Monitor, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { findUserById } from '../../data/users';
import { useAuth } from '../../context/AuthContext';

interface VideoCallProps {
  userId: string;
  onEndCall: () => void;
  isIncoming?: boolean;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  userId,
  onEndCall,
  isIncoming = false
}) => {
  const { user: currentUser } = useAuth();
  const [isCallActive, setIsCallActive] = useState(!isIncoming);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  
  const otherUser = findUserById(userId);
  
  // Mock WebRTC: In a real implementation, this would use navigator.mediaDevices.getUserMedia()
  // For this mock, we're just showing placeholder video elements
  useEffect(() => {
    // Simulate video streams - in real app would use getUserMedia() and RTCPeerConnection
    // For mock purposes, we'll just show the video elements without actual streams
  }, [isCallActive, currentUser, otherUser]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStartCall = () => {
    setIsCallActive(true);
  };
  
  const handleEndCall = () => {
    setIsCallActive(false);
    // In real implementation, would stop all media streams
    onEndCall();
  };
  
  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // In real implementation, would enable/disable video tracks
  };
  
  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // In real implementation, would enable/disable audio tracks
  };
  
  const toggleScreenShare = async () => {
    setIsScreenSharing(!isScreenSharing);
    // In real implementation, would use getDisplayMedia() to share screen
  };
  
  if (!otherUser || !currentUser) return null;
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Avatar
              src={otherUser.avatarUrl}
              alt={otherUser.name}
              size="sm"
              className="mr-2"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{otherUser.name}</p>
              <p className="text-xs text-gray-500">{formatTime(callDuration)}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="p-1"
            >
              <Maximize2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEndCall}
              className="p-1 text-error-600"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
        <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
          {isScreenSharing ? (
            <div className="text-center text-white">
              <Monitor size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Screen Sharing</p>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Avatar
                src={otherUser.avatarUrl}
                alt={otherUser.name}
                size="lg"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (!isCallActive) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-6">
              <Avatar
                src={otherUser.avatarUrl}
                alt={otherUser.name}
                size="xl"
                className="mx-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isIncoming ? 'Incoming Call' : 'Calling'}
            </h2>
            <p className="text-gray-600 mb-8">{otherUser.name}</p>
            
            <div className="flex justify-center space-x-4">
              {isIncoming && (
                <>
                  <Button
                    variant="error"
                    size="lg"
                    onClick={handleEndCall}
                    className="rounded-full p-4"
                  >
                    <Phone size={24} className="rotate-[135deg]" />
                  </Button>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleStartCall}
                    className="rounded-full p-4"
                  >
                    <Phone size={24} />
                  </Button>
                </>
              )}
              {!isIncoming && (
                <Button
                  variant="error"
                  size="lg"
                  onClick={handleEndCall}
                  className="rounded-full p-4"
                >
                  <Phone size={24} className="rotate-[135deg]" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-4 z-10 flex justify-between items-center">
        <div className="flex items-center text-white">
          <Avatar
            src={otherUser.avatarUrl}
            alt={otherUser.name}
            size="sm"
            className="mr-3"
          />
          <div>
            <p className="font-medium">{otherUser.name}</p>
            <p className="text-sm text-gray-300">{formatTime(callDuration)}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(true)}
          className="text-white hover:bg-white hover:bg-opacity-20"
        >
          <Minimize2 size={20} />
        </Button>
      </div>
      
      {/* Main video area */}
      <div className="flex-1 relative">
        {/* Remote video / Screen share */}
        <div className="absolute inset-0">
          {isScreenSharing ? (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <video
                ref={screenShareRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain hidden"
                muted
              />
              <div className="text-center text-white">
                <Monitor size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">Screen Sharing</p>
                <p className="text-sm text-gray-400 mt-2">Mock screen share view</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover hidden"
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar
                  src={otherUser.avatarUrl}
                  alt={otherUser.name}
                  size="3xl"
                />
              </div>
              <div className="absolute bottom-4 left-4 text-white text-lg font-medium bg-black bg-opacity-50 px-4 py-2 rounded">
                {otherUser.name}
              </div>
            </div>
          )}
        </div>
        
        {/* Local video preview */}
        <div className="absolute bottom-24 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-white">
          {isVideoEnabled ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover hidden"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  size="xl"
                />
              </div>
              <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                {currentUser.name}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <Avatar
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                size="lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <VideoOff size={32} className="text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6 z-10">
        <div className="flex justify-center items-center space-x-4">
          {/* Video Toggle */}
          <Button
            variant={isVideoEnabled ? 'outline' : 'error'}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full p-4 text-white border-white hover:bg-white hover:bg-opacity-20"
          >
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </Button>
          
          {/* Audio Toggle */}
          <Button
            variant={isAudioEnabled ? 'outline' : 'error'}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full p-4 text-white border-white hover:bg-white hover:bg-opacity-20"
          >
            {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </Button>
          
          {/* Screen Share */}
          <Button
            variant={isScreenSharing ? 'accent' : 'outline'}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full p-4 text-white border-white hover:bg-white hover:bg-opacity-20"
          >
            <Monitor size={24} />
          </Button>
          
          {/* End Call */}
          <Button
            variant="error"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full p-4"
          >
            <Phone size={24} className="rotate-[135deg]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

