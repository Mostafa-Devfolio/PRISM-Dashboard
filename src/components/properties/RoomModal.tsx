'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, BedDouble } from 'lucide-react';
import { useCreateRoomTypeMutation, useUpdateRoomTypeMutation } from '@/store/api';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  propertyId: string;
}

export function RoomModal({ isOpen, onClose, room, propertyId }: RoomModalProps) {
  const [createRoom, { isLoading: isCreating }] = useCreateRoomTypeMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomTypeMutation();
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      basePricePerNight: 0,
      totalUnits: 1,
      maxAdults: 2,
      maxChildren: 0,
      bedrooms: 1,
      bathrooms: 1,
      allowExtraGuests: false,
      extraGuestFee: 0,
      sizeSqm: 0,
      cancellationPolicy: '',
      beds: '',
      roomAmenities: ''
    }
  });

  useEffect(() => {
    if (room) {
      reset({
        name: room.name || '',
        basePricePerNight: room.basePricePerNight || 0,
        totalUnits: room.totalUnits || 1,
        maxAdults: room.maxAdults || 2,
        maxChildren: room.maxChildren || 0,
        bedrooms: room.bedrooms || 1,
        bathrooms: room.bathrooms || 1,
        allowExtraGuests: room.allowExtraGuests || false,
        extraGuestFee: room.extraGuestFee || 0,
        sizeSqm: room.sizeSqm || 0,
        cancellationPolicy: room.cancellationPolicy || '',
        beds: room.beds ? JSON.stringify(room.beds, null, 2) : '',
        roomAmenities: room.roomAmenities ? JSON.stringify(room.roomAmenities, null, 2) : ''
      });
    } else {
      reset({
        name: '', basePricePerNight: 0, totalUnits: 1, maxAdults: 2, maxChildren: 0, bedrooms: 1, bathrooms: 1,
        allowExtraGuests: false, extraGuestFee: 0, sizeSqm: 0, cancellationPolicy: '', beds: '', roomAmenities: ''
      });
    }
  }, [room, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      const parseJsonSafely = (str: string, fieldName: string) => {
        if (!str || str.trim() === '') return null;
        try { return JSON.parse(str); } catch (e) { throw new Error(`Invalid JSON format in ${fieldName}`); }
      };

      const payload = {
        name: data.name,
        basePricePerNight: parseFloat(data.basePricePerNight) || 0,
        totalUnits: parseInt(data.totalUnits) || 1,
        maxAdults: parseInt(data.maxAdults) || 2,
        maxChildren: parseInt(data.maxChildren) || 0,
        bedrooms: parseInt(data.bedrooms) || 1,
        bathrooms: parseInt(data.bathrooms) || 1,
        allowExtraGuests: data.allowExtraGuests,
        extraGuestFee: parseFloat(data.extraGuestFee) || 0,
        sizeSqm: parseInt(data.sizeSqm) || 0,
        cancellationPolicy: data.cancellationPolicy,
        beds: parseJsonSafely(data.beds, 'Beds'),
        roomAmenities: parseJsonSafely(data.roomAmenities, 'Room Amenities'),
        property: propertyId
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
            {room ? 'Edit Room Type' : 'Add New Room Type'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="room-form" onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Room Name</label>
              <input {...register('name')} placeholder="e.g. Deluxe Double Room" className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Base Price / Night ($)</label>
              <input type="number" step="0.01" min="0" {...register('basePricePerNight')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Total Units (Inventory)</label>
              <input type="number" min="1" {...register('totalUnits')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Max Adults</label>
              <input type="number" min="1" {...register('maxAdults')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Max Children</label>
              <input type="number" min="0" {...register('maxChildren')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Bedrooms</label>
              <input type="number" min="0" {...register('bedrooms')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Bathrooms</label>
              <input type="number" min="0" {...register('bathrooms')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
          </div>

          <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 col-span-2">
              <input type="checkbox" {...register('allowExtraGuests')} className="w-4 h-4 rounded text-primary" />
              <span className="text-sm font-medium">Allow Extra Guests</span>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Extra Guest Fee ($)</label>
              <input type="number" step="0.01" min="0" {...register('extraGuestFee')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Size (Sqm)</label>
              <input type="number" min="0" {...register('sizeSqm')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-semibold mb-1">Cancellation Policy</label>
            <textarea {...register('cancellationPolicy')} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 flex justify-between">Beds (JSON) <span className="text-xs text-muted-foreground font-normal">[{'{"type":"Double","count":1}'}]</span></label>
              <textarea {...register('beds')} rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-xs" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 flex justify-between">Amenities (JSON) <span className="text-xs text-muted-foreground font-normal">["Sea View"]</span></label>
              <textarea {...register('roomAmenities')} rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-xs" />
            </div>
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
