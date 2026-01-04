import { Meeting, MeetingRequest, AvailabilitySlot } from '../types';

// Mock availability slots
export const availabilitySlots: AvailabilitySlot[] = [
  {
    id: 'slot1',
    userId: 'i1',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T10:00:00Z',
    isRecurring: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'slot2',
    userId: 'i1',
    startTime: '2024-01-15T14:00:00Z',
    endTime: '2024-01-15T15:00:00Z',
    isRecurring: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'slot3',
    userId: 'e1',
    startTime: '2024-01-16T10:00:00Z',
    endTime: '2024-01-16T11:00:00Z',
    isRecurring: false,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Mock meeting requests
export const meetingRequests: MeetingRequest[] = [
  {
    id: 'req1',
    requesterId: 'e1',
    requesteeId: 'i1',
    slotId: 'slot1',
    startTime: '2024-01-20T09:00:00Z',
    endTime: '2024-01-20T10:00:00Z',
    title: 'Pitch Discussion',
    description: 'Would like to discuss our startup pitch and funding opportunities.',
    status: 'pending',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'req2',
    requesterId: 'e2',
    requesteeId: 'i1',
    startTime: '2024-01-22T14:00:00Z',
    endTime: '2024-01-22T15:00:00Z',
    title: 'Investment Discussion',
    description: 'Following up on our previous conversation about potential investment.',
    status: 'accepted',
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-09T00:00:00Z'
  },
  {
    id: 'req3',
    requesterId: 'i2',
    requesteeId: 'e1',
    startTime: '2024-01-25T11:00:00Z',
    endTime: '2024-01-25T12:00:00Z',
    title: 'Portfolio Review',
    description: 'Interested in learning more about your startup for potential investment.',
    status: 'pending',
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  }
];

// Mock confirmed meetings
export const meetings: Meeting[] = [
  {
    id: 'meeting1',
    requesterId: 'e1',
    requesteeId: 'i1',
    startTime: '2024-01-18T10:00:00Z',
    endTime: '2024-01-18T11:00:00Z',
    title: 'Initial Pitch Meeting',
    description: 'First meeting to discuss startup pitch and funding needs.',
    status: 'confirmed',
    createdAt: '2024-01-05T00:00:00Z'
  },
  {
    id: 'meeting2',
    requesterId: 'e2',
    requesteeId: 'i1',
    startTime: '2024-01-22T14:00:00Z',
    endTime: '2024-01-22T15:00:00Z',
    title: 'Investment Discussion',
    description: 'Following up on our previous conversation about potential investment.',
    status: 'confirmed',
    createdAt: '2024-01-08T00:00:00Z'
  }
];

// Helper functions
export const getAvailabilitySlotsForUser = (userId: string): AvailabilitySlot[] => {
  return availabilitySlots.filter(slot => slot.userId === userId);
};

export const getMeetingRequestsForUser = (userId: string): MeetingRequest[] => {
  return meetingRequests.filter(
    req => req.requesterId === userId || req.requesteeId === userId
  );
};

export const getPendingRequestsForUser = (userId: string): MeetingRequest[] => {
  return meetingRequests.filter(
    req => req.requesteeId === userId && req.status === 'pending'
  );
};

export const getConfirmedMeetingsForUser = (userId: string): Meeting[] => {
  return meetings.filter(
    meeting => 
      (meeting.requesterId === userId || meeting.requesteeId === userId) &&
      meeting.status === 'confirmed'
  );
};

export const addAvailabilitySlot = (slot: AvailabilitySlot): void => {
  availabilitySlots.push(slot);
};

export const updateAvailabilitySlot = (slotId: string, updates: Partial<AvailabilitySlot>): void => {
  const index = availabilitySlots.findIndex(slot => slot.id === slotId);
  if (index !== -1) {
    availabilitySlots[index] = { ...availabilitySlots[index], ...updates };
  }
};

export const deleteAvailabilitySlot = (slotId: string): void => {
  const index = availabilitySlots.findIndex(slot => slot.id === slotId);
  if (index !== -1) {
    availabilitySlots.splice(index, 1);
  }
};

export const createMeetingRequest = (request: MeetingRequest): void => {
  meetingRequests.push(request);
};

export const updateMeetingRequestStatus = (
  requestId: string,
  status: MeetingRequest['status']
): void => {
  const index = meetingRequests.findIndex(req => req.id === requestId);
  if (index !== -1) {
    meetingRequests[index] = {
      ...meetingRequests[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    // If accepted, create a confirmed meeting
    if (status === 'accepted') {
      const request = meetingRequests[index];
      const newMeeting: Meeting = {
        id: `meeting-${Date.now()}`,
        requesterId: request.requesterId,
        requesteeId: request.requesteeId,
        startTime: request.startTime,
        endTime: request.endTime,
        title: request.title,
        description: request.description,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      meetings.push(newMeeting);
    }
  }
};

