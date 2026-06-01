'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { CheckCircle2, MapPin, Loader2, AlertCircle, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { useGetRidesQuery, useGetParcelsQuery, useDeleteRideMutation, useDeleteParcelMutation } from '@/store/api';
import { RideModal } from '@/components/logistics/RideModal';
import { ParcelModal } from '@/components/logistics/ParcelModal';

export default function LogisticsPage() {
  const [tab, setTab] = useState<'rides' | 'parcels'>('rides');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [ridePage, setRidePage] = useState(1);
  const [parcelPage, setParcelPage] = useState(1);

  const { data: ridesRes, isLoading: ridesLoading, error: ridesError } = useGetRidesQuery({ page: ridePage, pageSize: 25 });
  const { data: parcelsRes, isLoading: parcelsLoading, error: parcelsError } = useGetParcelsQuery({ page: parcelPage, pageSize: 25 });

  const [deleteRide] = useDeleteRideMutation();
  const [deleteParcel] = useDeleteParcelMutation();

  const rides = ridesRes?.data || [];
  const ridesMeta = ridesRes?.meta?.pagination;
  const parcels = parcelsRes?.data || [];
  const parcelsMeta = parcelsRes?.meta?.pagination;

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleDeleteRide = async (id: string) => {
    if (confirm('Are you sure you want to delete this ride?')) {
      try {
        await deleteRide(id).unwrap();
      } catch (err) {
        alert('Failed to delete ride');
      }
    }
  };

  const handleDeleteParcel = async (id: string) => {
    if (confirm('Are you sure you want to delete this parcel?')) {
      try {
        await deleteParcel(id).unwrap();
      } catch (err) {
        alert('Failed to delete parcel');
      }
    }
  };

  const rideColumns = [
    { key: 'id', header: 'Ride ID', render: (r: any) => <span className="font-medium text-primary">#{r.id}</span> },
    { key: 'rider', header: 'Passenger', render: (r: any) => r.user?.username || r.user?.email || 'Guest' },
    { key: 'driver', header: 'Driver', render: (r: any) => r.driver?.username || r.driver?.email || 'Unassigned' },
    { key: 'pickup', header: 'Pickup', render: (r: any) => (
      <div className="flex items-start gap-1.5 text-sm max-w-[200px]">
        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5"/> 
        <span className="line-clamp-2" title={r.pickup?.address}>{r.pickup?.address || 'Unknown'}</span>
      </div>
    ) },
    { key: 'dropoff', header: 'Dropoff', render: (r: any) => (
      <div className="flex items-start gap-1.5 text-sm max-w-[200px]">
        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"/> 
        <span className="line-clamp-2" title={r.destination?.address}>{r.destination?.address || 'Unknown'}</span>
      </div>
    ) },
    { key: 'fare', header: 'Fare', render: (r: any) => <span className="font-semibold">${r.finalPrice || r.recommendedPrice || 0}</span> },
    { key: 'status', header: 'Status', render: (r: any) => {
      const status = r.status || 'pending';
      return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center w-fit gap-1.5 ${status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : ''} ${status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : ''} ${status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}`}>
          {status === 'pending' && <Clock className="w-3.5 h-3.5" />}
          {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
        </span>
      );
    } },
    { key: 'actions', header: 'Actions', render: (r: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleEdit(r)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-md hover:bg-primary/10">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => handleDeleteRide(r.documentId || r.id)} className="p-1.5 text-red-500 hover:text-red-600 transition-colors bg-red-500/10 rounded-md hover:bg-red-500/20">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ) }
  ];

  const parcelColumns = [
    { key: 'id', header: 'Booking #', render: (p: any) => <span className="font-medium text-primary">#{p.id}</span> },
    { key: 'sender', header: 'Sender', render: (p: any) => p.senderName || p.user?.username || 'Guest' },
    { key: 'courier', header: 'Courier', render: (p: any) => p.driver?.username || 'Unassigned' },
    { key: 'origin', header: 'Pickup', render: (p: any) => (
      <div className="flex items-start gap-1.5 text-sm max-w-[200px]">
        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5"/> 
        <span className="line-clamp-2" title={p.pickupLocation?.address}>{p.pickupLocation?.address || 'Unknown'}</span>
      </div>
    ) },
    { key: 'destination', header: 'Dropoff', render: (p: any) => (
      <div className="flex items-start gap-1.5 text-sm max-w-[200px]">
        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"/> 
        <span className="line-clamp-2" title={p.dropoffLocation?.address}>{p.dropoffLocation?.address || 'Unknown'}</span>
      </div>
    ) },
    { key: 'status', header: 'Status', render: (p: any) => {
      const status = p.deliveryStatus || 'pending';
      return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center w-fit gap-1.5 ${status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : ''} ${status === 'picked_up' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : ''} ${status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}`}>
          {status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
        </span>
      );
    } },
    { key: 'actions', header: 'Actions', render: (p: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleEdit(p)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-md hover:bg-primary/10">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => handleDeleteParcel(p.documentId || p.id)} className="p-1.5 text-red-500 hover:text-red-600 transition-colors bg-red-500/10 rounded-md hover:bg-red-500/20">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ) }
  ];

  const isLoading = tab === 'rides' ? ridesLoading : parcelsLoading;
  const error = tab === 'rides' ? ridesError : parcelsError;
  const data = tab === 'rides' ? rides : parcels;
  const meta = tab === 'rides' ? ridesMeta : parcelsMeta;
  const columns = tab === 'rides' ? rideColumns : parcelColumns;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Logistics Command Center</h1>
          <p className="text-muted-foreground">Monitor real-time passenger rides and parcel deliveries.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add {tab === 'rides' ? 'Ride' : 'Parcel'}
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-px">
        <button
          onClick={() => setTab('rides')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'rides' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
        >
          Passenger Rides
        </button>
        <button
          onClick={() => setTab('parcels')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'parcels' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
        >
          Parcel Deliveries
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading live {tab} from Strapi...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p className="font-medium">Failed to load {tab}. Check Strapi connection.</p>
        </div>
      ) : (
        <DataTable 
          data={data} 
          columns={columns} 
          title={tab === 'rides' ? "Live Ride Tracking" : "Live Parcel Tracking"}
          description={`Showing ${data.length} recent ${tab}.`}
          pagination={{
            page: meta?.page || (tab === 'rides' ? ridePage : parcelPage),
            pageCount: meta?.pageCount || (data.length === 25 ? (tab === 'rides' ? ridePage : parcelPage) + 1 : (tab === 'rides' ? ridePage : parcelPage)),
            onPageChange: (newPage) => {
              if (tab === 'rides') setRidePage(newPage);
              else setParcelPage(newPage);
            }
          }}
        />
      )}

      {isModalOpen && tab === 'rides' && (
        <RideModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          ride={selectedItem}
        />
      )}
      
      {isModalOpen && tab === 'parcels' && (
        <ParcelModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          parcel={selectedItem}
        />
      )}
    </div>
  );
}
