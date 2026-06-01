'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Plus, Edit2, Trash2, Users, Loader2, AlertCircle } from 'lucide-react';
import { useGetBusTripsQuery, useDeleteBusTripMutation } from '@/store/api';
import { BusTripModal } from '@/components/bus-trips/BusTripModal';

export default function BusTripsPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, error } = useGetBusTripsQuery({ page, pageSize: 25 });
  const [deleteTrip] = useDeleteBusTripMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  const trips = response?.data || [];
  const meta = response?.meta?.pagination;

  const handleAdd = () => {
    setSelectedTrip(null);
    setIsModalOpen(true);
  };

  const handleEdit = (trip: any) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bus trip?')) {
      try {
        await deleteTrip(id).unwrap();
      } catch (err) {
        console.error('Failed to delete trip:', err);
        alert('Failed to delete trip.');
      }
    }
  };

  const columns = [
    { key: 'route', header: 'Route', render: (t: any) => <span className="font-semibold text-foreground">{t.route}</span> },
    { key: 'departure', header: 'Departure Time', render: (t: any) => (
      <span className="text-muted-foreground">{new Date(t.departureTime).toLocaleString()}</span>
    )},
    { key: 'bus', header: 'Bus #', render: (t: any) => <span className="font-medium">{t.busNumber}</span> },
    { key: 'seats', header: 'Availability', render: (t: any) => (
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className={`font-medium ${t.availableSeats < 5 ? "text-red-500" : "text-emerald-500"}`}>
          {t.availableSeats} / {t.totalSeats}
        </span>
      </div>
    )},
    { key: 'status', header: 'Status', render: (t: any) => (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${t.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : ''} ${t.status === 'Boarding' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : ''} ${t.status === 'In Transit' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' : ''} ${t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''} ${t.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : ''}`}>{t.status || 'Scheduled'}</span>
    )},
    { key: 'actions', header: 'Actions', render: (t: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleEdit(t)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(t.documentId || t.id)} className="p-1.5 text-red-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bus Trips Schedule</h1>
          <p className="text-muted-foreground">Manage inter-city bus schedules and seat availability.</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Schedule Trip
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading live bus schedules from Strapi...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p className="font-medium">Failed to load schedules. Check Strapi connection.</p>
        </div>
      ) : (
        <DataTable 
          data={trips} 
          columns={columns} 
          title="Live Schedule" 
          description={meta ? `Showing page ${meta.page} of ${meta.pageCount} (${meta.total} total trips).` : `${trips.length} scheduled trips.`}
          pagination={meta ? { page: meta.page, pageCount: meta.pageCount, onPageChange: setPage } : undefined}
        />
      )}

      <BusTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} trip={selectedTrip} />
    </div>
  );
}
