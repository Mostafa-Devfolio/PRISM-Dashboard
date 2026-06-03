'use client';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Loader2, Plus, Trash2, BedDouble } from 'lucide-react';
import { useCreateRoomMutation, useUpdateRoomMutation } from '@/store/api';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  propertyId: string;
}

export function RoomModal({ isOpen, onClose, room, propertyId }: RoomModalProps) {
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      name: '',
      roomType: 'standard',
      capacity: 2,
      basePrice: 0,
      description: '',
      options: [] as { name: string, price: number }[]
    }
  });

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: 'options'
  });

  useEffect(() => {
    if (room) {
      reset({
        name: room.name || room.roomType || '',
        roomType: room.roomType || 'standard',
        capacity: room.capacity || 2,
        basePrice: room.basePrice || 0,
        description: room.description || '',
        options: room.options || []
      });
    } else {
      reset({
        name: '',
        roomType: 'standard',
        capacity: 2,
        basePrice: 0,
        description: '',
        options: []
      });
    }
  }, [room, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        property: propertyId,
        capacity: parseInt(data.capacity) || 1,
        basePrice: parseFloat(data.basePrice) || 0,
        options: data.options.map((opt: any) => ({
          name: opt.name,
          price: parseFloat(opt.price) || 0
        }))
      };

      if (room && (room.id || room.documentId)) {
        await updateRoom({ documentId: room.documentId || room.id, ...payload }).unwrap();
      } else {
        await createRoom(payload).unwrap();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save room:', error);
      alert(error.message || 'Failed to save room details.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-border bg-muted/30">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-primary" />
            {room ? 'Edit Room / Pricing Option' : 'Add New Room / Pricing Option'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="room-form" onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-1">Room Name / Configuration</label>
              <input {...register('name')} placeholder="e.g. Deluxe Double Room" className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-semibold mb-1">Type</label>
              <select {...register('roomType')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                <option value="standard">Standard Room</option>
                <option value="deluxe">Deluxe Room</option>
                <option value="suite">Suite</option>
                <option value="apartment_layout">Apartment Layout</option>
                <option value="villa_setup">Villa Setup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Max Capacity (Adults)</label>
              <input type="number" min="1" {...register('capacity')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Base Price / Night ($)</label>
              <input type="number" step="0.01" min="0" {...register('basePrice')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Description & Amenities specific to this room</label>
              <textarea {...register('description')} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Add-ons & Options</h3>
              <button type="button" onClick={() => appendOption({ name: '', price: 0 })} className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded-md flex items-center gap-1 transition-colors">
                <Plus className="w-3 h-3" /> Add Option
              </button>
            </div>
            
            {optionFields.length === 0 ? (
              <p className="text-sm text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-border">No pricing add-ons configured. (e.g., Breakfast +$20)</p>
            ) : (
              <div className="space-y-2">
                {optionFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input {...register(`options.${index}.name` as const)} placeholder="Option name (e.g. Sea View)" className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-lg" required />
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1.5 text-muted-foreground text-sm">$</span>
                      <input type="number" step="0.01" {...register(`options.${index}.price` as const)} placeholder="Price" className="w-full pl-6 pr-3 py-1.5 text-sm bg-background border border-border rounded-lg" required />
                    </div>
                    <button type="button" onClick={() => removeOption(index)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="p-5 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-background border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button type="submit" form="room-form" disabled={isCreating || isUpdating} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Room Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
