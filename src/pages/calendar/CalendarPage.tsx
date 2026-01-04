import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AvailabilitySlotManager } from '../../components/calendar/AvailabilitySlotManager';
import { MeetingRequestCard } from '../../components/calendar/MeetingRequestCard';
import { useAuth } from '../../context/AuthContext';
import {
  AvailabilitySlot,
  MeetingRequest,
  Meeting
} from '../../types';
import {
  getAvailabilitySlotsForUser,
  getMeetingRequestsForUser,
  getPendingRequestsForUser,
  getConfirmedMeetingsForUser,
  addAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  createMeetingRequest,
  updateMeetingRequestStatus
} from '../../data/meetings';
import { findUserById, users } from '../../data/users';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState<'calendar' | 'slots' | 'requests'>('calendar');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    requesteeId: '',
    startTime: '',
    endTime: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;
    
    const userSlots = getAvailabilitySlotsForUser(user.id);
    const userRequests = getMeetingRequestsForUser(user.id);
    const userMeetings = getConfirmedMeetingsForUser(user.id);
    
    setSlots(userSlots);
    setMeetingRequests(userRequests);
    setMeetings(userMeetings);
  };

  const handleAddSlot = (slotData: Omit<AvailabilitySlot, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    const newSlot: AvailabilitySlot = {
      ...slotData,
      userId: user.id,
      id: `slot-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    addAvailabilitySlot(newSlot);
    setSlots([...slots, newSlot]);
    toast.success('Availability slot added successfully');
  };

  const handleEditSlot = (slotId: string, updates: Partial<AvailabilitySlot>) => {
    updateAvailabilitySlot(slotId, updates);
    setSlots(slots.map(slot => slot.id === slotId ? { ...slot, ...updates } : slot));
    toast.success('Availability slot updated successfully');
  };

  const handleDeleteSlot = (slotId: string) => {
    deleteAvailabilitySlot(slotId);
    setSlots(slots.filter(slot => slot.id !== slotId));
    toast.success('Availability slot deleted successfully');
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo.start);
    setRequestFormData({
      ...requestFormData,
      startTime: format(selectInfo.start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(selectInfo.end, "yyyy-MM-dd'T'HH:mm")
    });
    setShowRequestModal(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const eventData = event.extendedProps;
    
    if (eventData.type === 'meeting') {
      toast.success(`Meeting: ${event.title}`);
    } else if (eventData.type === 'slot') {
      toast.success(`Availability: ${event.title}`);
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !requestFormData.requesteeId) return;
    
    const newRequest: MeetingRequest = {
      id: `req-${Date.now()}`,
      requesterId: user.id,
      requesteeId: requestFormData.requesteeId,
      startTime: new Date(requestFormData.startTime).toISOString(),
      endTime: new Date(requestFormData.endTime).toISOString(),
      title: requestFormData.title,
      description: requestFormData.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    createMeetingRequest(newRequest);
    setMeetingRequests([...meetingRequests, newRequest]);
    setShowRequestModal(false);
    setRequestFormData({
      requesteeId: '',
      startTime: '',
      endTime: '',
      title: '',
      description: ''
    });
    toast.success('Meeting request sent successfully');
  };

  const handleRequestStatusUpdate = (requestId: string, status: MeetingRequest['status']) => {
    updateMeetingRequestStatus(requestId, status);
    setMeetingRequests(meetingRequests.map(req => 
      req.id === requestId ? { ...req, status, updatedAt: new Date().toISOString() } : req
    ));
    
    if (status === 'accepted') {
      loadData(); // Reload to get new meeting
    }
  };

  // Prepare calendar events
  const calendarEvents: EventInput[] = [
    // Availability slots
    ...slots.map(slot => ({
      id: slot.id,
      title: 'Available',
      start: slot.startTime,
      end: slot.endTime,
      color: '#10b981',
      extendedProps: { type: 'slot' }
    })),
    // Confirmed meetings
    ...meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      start: meeting.startTime,
      end: meeting.endTime,
      color: '#3b82f6',
      extendedProps: { type: 'meeting' }
    })),
    // Pending meeting requests
    ...meetingRequests
      .filter(req => req.status === 'pending' && req.requesterId === user?.id)
      .map(req => ({
        id: req.id,
        title: `Pending: ${req.title}`,
        start: req.startTime,
        end: req.endTime,
        color: '#f59e0b',
        extendedProps: { type: 'request' }
      }))
  ];

  if (!user) return null;

  const pendingRequests = getPendingRequestsForUser(user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your availability and meetings</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={view === 'calendar' ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<CalendarIcon size={18} />}
            onClick={() => setView('calendar')}
          >
            Calendar
          </Button>
          <Button
            variant={view === 'slots' ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<Clock size={18} />}
            onClick={() => setView('slots')}
          >
            Availability
          </Button>
          <Button
            variant={view === 'requests' ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<Plus size={18} />}
            onClick={() => setView('requests')}
          >
            Requests
          </Button>
        </div>
      </div>

      {view === 'calendar' && (
        <Card>
          <CardBody>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={calendarEvents}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              height="auto"
            />
          </CardBody>
        </Card>
      )}

      {view === 'slots' && (
        <AvailabilitySlotManager
          slots={slots}
          onAdd={handleAddSlot}
          onEdit={handleEditSlot}
          onDelete={handleDeleteSlot}
        />
      )}

      {view === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  Pending Meeting Requests ({pendingRequests.length})
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {pendingRequests.map(request => (
                  <MeetingRequestCard
                    key={request.id}
                    request={request}
                    currentUserId={user.id}
                    onStatusUpdate={handleRequestStatusUpdate}
                  />
                ))}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">All Meeting Requests</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {meetingRequests.length > 0 ? (
                meetingRequests.map(request => (
                  <MeetingRequestCard
                    key={request.id}
                    request={request}
                    currentUserId={user.id}
                    onStatusUpdate={handleRequestStatusUpdate}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No meeting requests yet</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">Send Meeting Request</h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select User
                  </label>
                  <select
                    value={requestFormData.requesteeId}
                    onChange={(e) => setRequestFormData({ ...requestFormData, requesteeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Choose a user...</option>
                    {users
                      .filter(u => u.id !== user?.id && u.role !== user?.role)
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role === 'entrepreneur' ? 'Entrepreneur' : 'Investor'})
                        </option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={requestFormData.title}
                    onChange={(e) => setRequestFormData({ ...requestFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={requestFormData.description}
                    onChange={(e) => setRequestFormData({ ...requestFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={requestFormData.startTime}
                      onChange={(e) => setRequestFormData({ ...requestFormData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={requestFormData.endTime}
                      onChange={(e) => setRequestFormData({ ...requestFormData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" size="sm">
                    Send Request
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRequestModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

