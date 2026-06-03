'use client';
import { showAlert, showConfirm } from '@/lib/custom-alerts';

import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { CheckCircle2, MapPin, Loader2, AlertCircle, Plus, Edit2, Trash2, Clock, Car, Package, DollarSign } from 'lucide-react';
import { useGetRidesQuery, useGetParcelsQuery, useDeleteRideMutation, useDeleteParcelMutation, useGetPricingConfigQuery, useGetParcelTypesQuery, useDeleteParcelTypeMutation } from '@/store/api';
import { RideModal } from '@/components/logistics/RideModal';
import { ParcelModal } from '@/components/logistics/ParcelModal';
import { VehicleFareModal } from '@/components/logistics/VehicleFareModal';
import { ParcelTypeModal } from '@/components/logistics/ParcelTypeModal';

export default function LogisticsPage() {
  const [tab, setTab] = useState<'rides' | 'parcels' | 'vehicle_types' | 'parcel_types'>('rides');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [ridePage, setRidePage] = useState(1);
  const [parcelPage, setParcelPage] = useState(1);

  const { data: ridesRes, isLoading: ridesLoading, error: ridesError } = useGetRidesQuery({ page: ridePage, pageSize: 25 });
  const { data: parcelsRes, isLoading: parcelsLoading, error: parcelsError } = useGetParcelsQuery({ page: parcelPage, pageSize: 25 });
  const { data: pricingConfigRes, isLoading: pricingLoading, error: pricingError } = useGetPricingConfigQuery({});
  const { data: pTypesRes, isLoading: pTypesLoading, error: pTypesError } = useGetParcelTypesQuery({});

  const [deleteRide] = useDeleteRideMutation();
  const [deleteParcel] = useDeleteParcelMutation();
  const [deleteParcelType] = useDeleteParcelTypeMutation();

  const rides = ridesRes?.data || [];
  const ridesMeta = ridesRes?.meta?.pagination;
  const parcels = parcelsRes?.data || [];
  const parcelsMeta = parcelsRes?.meta?.pagination;
  const pricingConfig = pricingConfigRes?.data || null;
  const parcelTypes = pTypesRes?.data || [];

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleDeleteRide = async (id: string) => {
    if (await showConfirm('Are you sure you want to delete this ride?')) {
      try {
        await deleteRide(id).unwrap();
      } catch (err) {
        showAlert('Failed to delete ride');
      }
    }
  };

  const handleDeleteParcel = async (id: string) => {
    if (await showConfirm('Are you sure you want to delete this parcel?')) {
      try {
        await deleteParcel(id).unwrap();
      } catch (err) {
        showAlert('Failed to delete parcel');
      }
    }
  };

  const handleDeleteParcelType = async (id: string) => {
    if (await showConfirm('Are you sure you want to delete this parcel type?')) {
      try { await deleteParcelType(id).unwrap(); } catch (err) { showAlert('Failed to delete parcel type'); }
    }
  };

  const rideColumns = [
    { key: 'id', header: 'Ride ID', render: (r: any) => <span className="font-medium text-primary">#{r.id}</span> },
    { key: 'rider', header: 'Passenger', render: (r: any) => r.user?.username || r.user?.email || 'Guest' },
    { key: 'driver', header: 'Driver', render: (r: any) => r.driver ? (r.driver.username || r.driver.email) : <span className="text-muted-foreground italic">Assigning...</span> },
    { key: 'pickup', header: 'Pickup', render: (r: any) => (
      <div className="flex items-center gap-1.5 max-w-[200px] truncate" title={r.pickup?.address}>
        <MapPin className="w-3 h-3 text-primary shrink-0" />
        <span className="truncate">{r.pickup?.address || 'Unknown'}</span>
      </div>
    )},
    { key: 'destination', header: 'Destination', render: (r: any) => (
      <div className="flex items-center gap-1.5 max-w-[200px] truncate" title={r.destination?.address}>
        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
        <span className="truncate">{r.destination?.address || 'Unknown'}</span>
      </div>
    )},
    { key: 'fare', header: 'Fare', render: (r: any) => <span className="font-bold">${r.finalPrice || r.recommendedPrice || 0}</span> },
    { key: 'status', header: 'Status', render: (r: any) => {
      const colors: any = {
        'pending': 'bg-yellow-100 text-yellow-700',
        'searching_driver': 'bg-blue-100 text-blue-700',
        'accepted': 'bg-purple-100 text-purple-700',
        'on_way': 'bg-indigo-100 text-indigo-700',
        'in_progress': 'bg-orange-100 text-orange-700',
        'completed': 'bg-emerald-100 text-emerald-700',
        'cancelled': 'bg-red-100 text-red-700'
      };
      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${colors[r.status] || 'bg-muted text-muted-foreground'}`}>
          {r.status?.replace('_', ' ')}
        </span>
      );
    }},
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
    { key: 'id', header: 'Parcel ID', render: (p: any) => <span className="font-medium text-primary">#{p.id}</span> },
    { key: 'sender', header: 'Sender', render: (p: any) => p.sender?.username || p.sender?.email || 'Guest' },
    { key: 'type', header: 'Type', render: (p: any) => <span className="capitalize">{p.parcelType || 'Standard'}</span> },
    { key: 'weight', header: 'Weight', render: (p: any) => `${p.weightKg || 0} Kg` },
    { key: 'pickup', header: 'Pickup', render: (p: any) => (
      <div className="flex items-center gap-1.5 max-w-[150px] truncate" title={p.pickup?.address}>
        <MapPin className="w-3 h-3 text-primary shrink-0" />
        <span className="truncate">{p.pickup?.address || 'Unknown'}</span>
      </div>
    )},
    { key: 'dropoff', header: 'Dropoff', render: (p: any) => (
      <div className="flex items-center gap-1.5 max-w-[150px] truncate" title={p.dropoff?.address}>
        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
        <span className="truncate">{p.dropoff?.address || 'Unknown'}</span>
      </div>
    )},
    { key: 'status', header: 'Status', render: (p: any) => {
      const colors: any = {
        'pending': 'bg-yellow-100 text-yellow-700',
        'accepted': 'bg-purple-100 text-purple-700',
        'picked_up': 'bg-indigo-100 text-indigo-700',
        'in_transit': 'bg-blue-100 text-blue-700',
        'delivered': 'bg-emerald-100 text-emerald-700',
        'cancelled': 'bg-red-100 text-red-700'
      };
      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${colors[p.status] || 'bg-muted text-muted-foreground'}`}>
          {p.status?.replace('_', ' ')}
        </span>
      );
    }},
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

  const parcelTypeColumns = [
    { key: 'name', header: 'Parcel Type', render: (p: any) => <span className="font-bold text-foreground capitalize">{p.name}</span> },
    { key: 'baseFee', header: 'Base Fee', render: (p: any) => <span className="font-medium">${p.baseFee}</span> },
    { key: 'maxWeightKg', header: 'Max Weight', render: (p: any) => <span className="text-muted-foreground">{p.maxWeightKg} kg</span> },
    { key: 'status', header: 'Status', render: (p: any) => (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${p.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {p.isActive !== false ? 'Active' : 'Disabled'}
      </span>
    )},
    { key: 'actions', header: 'Actions', render: (p: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleEdit(p)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-md hover:bg-primary/10"><Edit2 className="w-4 h-4" /></button>
        <button onClick={() => handleDeleteParcelType(p.documentId || p.id)} className="p-1.5 text-red-500 hover:text-red-600 transition-colors bg-red-500/10 rounded-md hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
      </div>
    )}
  ];

  const isLoading = tab === 'rides' ? ridesLoading : tab === 'parcels' ? parcelsLoading : tab === 'vehicle_types' ? pricingLoading : pTypesLoading;
  const error = tab === 'rides' ? ridesError : tab === 'parcels' ? parcelsError : tab === 'vehicle_types' ? pricingError : pTypesError;
  const data = tab === 'rides' ? rides : tab === 'parcels' ? parcels : parcelTypes;
  const meta = tab === 'rides' ? ridesMeta : tab === 'parcels' ? parcelsMeta : null;
  const columns = tab === 'rides' ? rideColumns : tab === 'parcels' ? parcelColumns : parcelTypeColumns;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Logistics & Fleet Command
          </h1>
          <p className="text-muted-foreground">Manage active passenger rides, delivery parcels, and view real-time operations.</p>
        </div>
        {(tab !== 'vehicle_types') && (
          <button 
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add {tab === 'rides' ? 'Ride' : tab === 'parcels' ? 'Parcel' : 'Parcel Type'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto">
        <button
          onClick={() => setTab('rides')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === 'rides' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
        >
          <Car className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Passenger Rides
        </button>
        <button
          onClick={() => setTab('parcels')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === 'parcels' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
        >
          <Package className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Parcel Deliveries
        </button>
        <button
          onClick={() => setTab('vehicle_types')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === 'vehicle_types' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
        >
          <DollarSign className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Global Pricing & Fares
        </button>
        <button
          onClick={() => setTab('parcel_types')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === 'parcel_types' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
        >
          <DollarSign className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Parcel Types & Pricing
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-card rounded-xl border border-border shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl flex items-center justify-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <p className="font-medium">Failed to load data. Check Strapi connection.</p>
        </div>
      ) : tab === 'vehicle_types' ? (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" /> Global Pricing Config
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Ride Fares</h3>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium">Car Base Fee</span>
                <span className="font-bold">${pricingConfig?.carBaseFee}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium">Car Per Km</span>
                <span className="font-bold">${pricingConfig?.carPerKmFee}/km</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium">Comfort Surcharge</span>
                <span className="font-bold">+${pricingConfig?.comfortSurcharge}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium">Motorcycle Base Fee</span>
                <span className="font-bold">${pricingConfig?.motorcycleBaseFee}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium">Bus Base Fee</span>
                <span className="font-bold">${pricingConfig?.busBaseFee}</span>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Fees & Policies</h3>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium">Free Waiting Time</span>
                <span className="font-bold">{pricingConfig?.freeWaitingTimeMinutes} mins</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium">Waiting Fee Per Min</span>
                <span className="font-bold">${pricingConfig?.waitingFeePerMinute}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium">Surge Multiplier</span>
                <span className="font-bold">{pricingConfig?.surgeMultiplier}x</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm font-medium">Platform Commission</span>
                <span className="font-bold">{pricingConfig?.platformCommissionPercent}%</span>
              </div>
              <button 
                onClick={() => { setSelectedItem(pricingConfig); setIsModalOpen(true); }}
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Edit Global Pricing
              </button>
            </div>
          </div>
        </div>
      ) : (
        <DataTable 
          data={data} 
          columns={columns} 
          title={tab === 'rides' ? "Live Ride Tracking" : tab === 'parcels' ? "Live Parcel Tracking" : "Parcel Pricing Models"}
          description={`Showing ${data.length} records.`}
          pagination={meta ? {
            page: meta.page || (tab === 'rides' ? ridePage : parcelPage),
            pageCount: meta.pageCount || (data.length === 25 ? (tab === 'rides' ? ridePage : parcelPage) + 1 : (tab === 'rides' ? ridePage : parcelPage)),
            onPageChange: (newPage) => {
              if (tab === 'rides') setRidePage(newPage);
              else if (tab === 'parcels') setParcelPage(newPage);
            }
          } : undefined}
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

      {isModalOpen && tab === 'vehicle_types' && (
        <VehicleFareModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pricingConfig={selectedItem}
        />
      )}

      {isModalOpen && tab === 'parcel_types' && (
        <ParcelTypeModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          parcelType={selectedItem}
        />
      )}
    </div>
  );
}
