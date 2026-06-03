'use client';
import { showAlert, showConfirm } from '@/lib/custom-alerts';

import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Calendar, Users, CheckCircle2, Clock, XCircle, LogOut, LogIn, Loader2, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetBookingsQuery, useDeleteBookingMutation } from '@/store/api';
import { BookingModal } from '@/components/bookings/BookingModal';

export default function BookingsPage() {
  const { data: response, isLoading, error } = useGetBookingsQuery({});
  const [deleteBooking] = useDeleteBookingMutation();
  
  const [tab, setTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const rawBookings = response?.data || [];
  
  const filteredBookings = tab === 'all' 
    ? rawBookings 
    : rawBookings.filter((b: any) => b.status === tab);

  const handleEdit = (booking: any) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (await showConfirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(id).unwrap();
      } catch (err) {
        showAlert('Failed to delete booking');
      }
    }
  };

  const columns = [
    { key: 'property', header: 'Property & Room', render: (b: any) => (
      <div>
        <p className="font-semibold text-foreground">{b.property?.name || b.property?.title || 'Unknown Property'}</p>
        <p className="text-xs text-muted-foreground">{b.bookedRooms?.[0]?.roomTypeId || 'Standard Room'}</p>
      </div>
    )},
    { key: 'guest', header: 'Guest', render: (b: any) => {
      const guestName = (b.guestFirstName || b.guestLastName) ? `${b.guestFirstName || ''} ${b.guestLastName || ''}`.trim() : b.guest?.username || 'Guest';
      const initial = guestName.charAt(0) || 'G';
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {initial}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{guestName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" /> {b.bookedRooms?.[0]?.guests || 1} Guests
            </div>
          </div>
        </div>
      );
    }},
    { key: 'dates', header: 'Stay Dates', render: (b: any) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4 text-primary" />
        <span>{new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}</span>
      </div>
    )},
    { key: 'status', header: 'Status', render: (b: any) => {
      const status = b.status || 'pending';
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-md text-xs font-medium flex items-center w-fit gap-1.5",
          status === 'pending' && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
          status === 'confirmed' && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
          status === 'checked_in' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
          status === 'checked_out' && "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
          status === 'cancelled' && "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
        )}>
          {status === 'pending' && <Clock className="w-3.5 h-3.5" />}
          {status === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {status === 'checked_in' && <LogIn className="w-3.5 h-3.5" />}
          {status === 'checked_out' && <LogOut className="w-3.5 h-3.5" />}
          {status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
          {status.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
        </span>
      );
    }},
    { key: 'actions', header: 'Actions', render: (b: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleEdit(b)} title="Update Status" className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-md hover:bg-primary/10">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => handleDelete(b.documentId || b.id)} title="Delete Booking" className="p-1.5 text-red-500 hover:text-red-600 transition-colors bg-red-500/10 rounded-md hover:bg-red-500/20">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Hotel & Property Bookings</h1>
          <p className="text-muted-foreground">Manage global reservations, check-ins, and property statuses.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Booking
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto">
        {['all', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {t === 'all' ? 'All Bookings' : t.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading live bookings from Strapi...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p className="font-medium">Failed to load bookings. Check Strapi connection.</p>
        </div>
      ) : (
        <DataTable data={filteredBookings} columns={columns} title="Live Booking Registry" description={`${filteredBookings.length} reservations found.`} />
      )}

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} booking={selectedBooking} />
    </div>
  );
}
