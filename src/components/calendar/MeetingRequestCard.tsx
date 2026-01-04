import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Calendar, Clock, User } from 'lucide-react';
import { MeetingRequest } from '../../types';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { findUserById } from '../../data/users';
import { updateMeetingRequestStatus } from '../../data/meetings';
import { format, formatDistanceToNow } from 'date-fns';

interface MeetingRequestCardProps {
  request: MeetingRequest;
  currentUserId: string;
  onStatusUpdate?: (requestId: string, status: MeetingRequest['status']) => void;
}

export const MeetingRequestCard: React.FC<MeetingRequestCardProps> = ({
  request,
  currentUserId,
  onStatusUpdate
}) => {
  const navigate = useNavigate();
  const isRequester = request.requesterId === currentUserId;
  const otherUser = findUserById(isRequester ? request.requesteeId : request.requesterId);
  
  if (!otherUser) return null;
  
  const handleAccept = () => {
    updateMeetingRequestStatus(request.id, 'accepted');
    if (onStatusUpdate) {
      onStatusUpdate(request.id, 'accepted');
    }
  };
  
  const handleDecline = () => {
    updateMeetingRequestStatus(request.id, 'declined');
    if (onStatusUpdate) {
      onStatusUpdate(request.id, 'declined');
    }
  };
  
  const handleCancel = () => {
    updateMeetingRequestStatus(request.id, 'cancelled');
    if (onStatusUpdate) {
      onStatusUpdate(request.id, 'cancelled');
    }
  };
  
  const handleMessage = () => {
    navigate(`/chat/${otherUser.id}`);
  };
  
  const handleViewProfile = () => {
    navigate(`/profile/${otherUser.role}/${otherUser.id}`);
  };
  
  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'declined':
        return <Badge variant="error">Declined</Badge>;
      case 'cancelled':
        return <Badge variant="gray">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  const meetingDate = new Date(request.startTime);
  const meetingEnd = new Date(request.endTime);
  
  return (
    <Card className="transition-all duration-300">
      <CardBody className="flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <Avatar
              src={otherUser.avatarUrl}
              alt={otherUser.name}
              size="md"
              status={otherUser.isOnline ? 'online' : 'offline'}
              className="mr-3"
            />
            
            <div>
              <h3 className="text-md font-semibold text-gray-900">{otherUser.name}</h3>
              <p className="text-sm text-gray-500">
                {isRequester ? 'You requested' : 'Requested from you'} • {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {getStatusBadge()}
        </div>
        
        <div className="mt-4 space-y-2">
          <div>
            <h4 className="text-sm font-medium text-gray-900">{request.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{request.description}</p>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mt-3">
            <Calendar size={16} className="mr-2" />
            <span>{format(meetingDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2" />
            <span>
              {format(meetingDate, 'h:mm a')} - {format(meetingEnd, 'h:mm a')}
            </span>
          </div>
        </div>
      </CardBody>
      
      <CardFooter className="border-t border-gray-100 bg-gray-50">
        {request.status === 'pending' ? (
          isRequester ? (
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<X size={16} />}
                onClick={handleCancel}
              >
                Cancel Request
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<User size={16} />}
                onClick={handleViewProfile}
              >
                View Profile
              </Button>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<X size={16} />}
                  onClick={handleDecline}
                >
                  Decline
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  leftIcon={<Check size={16} />}
                  onClick={handleAccept}
                >
                  Accept
                </Button>
              </div>
              
              <Button
                variant="primary"
                size="sm"
                leftIcon={<User size={16} />}
                onClick={handleViewProfile}
              >
                View Profile
              </Button>
            </div>
          )
        ) : (
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<User size={16} />}
              onClick={handleMessage}
            >
              Message
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

