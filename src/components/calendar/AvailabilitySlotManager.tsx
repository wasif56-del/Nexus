import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import { AvailabilitySlot } from '../../types';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';

interface AvailabilitySlotManagerProps {
  slots: AvailabilitySlot[];
  onAdd: (slot: Omit<AvailabilitySlot, 'id' | 'createdAt'>) => void;
  onEdit: (slotId: string, updates: Partial<AvailabilitySlot>) => void;
  onDelete: (slotId: string) => void;
}

export const AvailabilitySlotManager: React.FC<AvailabilitySlotManagerProps> = ({
  slots,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    isRecurring: false,
    dayOfWeek: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      onEdit(editingId, {
        startTime: formData.startTime,
        endTime: formData.endTime,
        isRecurring: formData.isRecurring,
        dayOfWeek: formData.isRecurring ? parseInt(formData.dayOfWeek) : undefined
      });
      setEditingId(null);
    } else {
      onAdd({
        userId: '', // Will be set by parent
        startTime: formData.startTime,
        endTime: formData.endTime,
        isRecurring: formData.isRecurring,
        dayOfWeek: formData.isRecurring ? parseInt(formData.dayOfWeek) : undefined
      });
      setIsAdding(false);
    }
    
    setFormData({
      startTime: '',
      endTime: '',
      isRecurring: false,
      dayOfWeek: ''
    });
  };

  const handleEdit = (slot: AvailabilitySlot) => {
    setEditingId(slot.id);
    setFormData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      isRecurring: slot.isRecurring || false,
      dayOfWeek: slot.dayOfWeek?.toString() || ''
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      startTime: '',
      endTime: '',
      isRecurring: false,
      dayOfWeek: ''
    });
  };

  const formatSlotTime = (slot: AvailabilitySlot) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    
    if (slot.isRecurring && slot.dayOfWeek !== undefined) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${days[slot.dayOfWeek]}: ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    }
    
    return `${format(start, 'MMM d, yyyy h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Availability Slots</h3>
        {!isAdding && (
          <Button
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsAdding(true)}
          >
            Add Slot
          </Button>
        )}
      </CardHeader>
      
      <CardBody>
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
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
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                Recurring weekly
              </label>
            </div>
            
            {formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required={formData.isRecurring}
                >
                  <option value="">Select day</option>
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button type="submit" size="sm">
                {editingId ? 'Update' : 'Add'} Slot
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        )}
        
        <div className="space-y-3">
          {slots.length > 0 ? (
            slots.map(slot => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Clock size={18} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatSlotTime(slot)}
                    </p>
                    {slot.isRecurring && (
                      <Badge variant="primary" className="mt-1">
                        Recurring
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit size={14} />}
                    onClick={() => handleEdit(slot)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => onDelete(slot.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p>No availability slots yet</p>
              <p className="text-sm mt-1">Add slots to let others know when you're available</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

