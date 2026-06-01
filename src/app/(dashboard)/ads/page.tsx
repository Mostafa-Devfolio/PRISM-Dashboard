'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { CheckCircle2, XCircle, Clock, ShieldAlert, Eye, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetLocalServicesQuery, useGetClassifiedAdsQuery } from '@/store/api';
import { AdModal } from '@/components/ads/AdModal';

export default function AdsPage() {
  const [tab, setTab] = useState<'services' | 'classifieds'>('services');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: servicesRes, isLoading: servicesLoading, error: servicesError } = useGetLocalServicesQuery({});
  const { data: adsRes, isLoading: adsLoading, error: adsError } = useGetClassifiedAdsQuery({});

  const services = servicesRes?.data || [];
  const classifieds = adsRes?.data || [];

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const statusRender = (s: any) => {
    const status = s.status || 'pending';
    return (
      <span className={cn(
        "px-2.5 py-1 rounded-md text-xs font-medium flex items-center w-fit gap-1.5",
        status === 'pending' && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
        status === 'approved' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
        status === 'rejected' && "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
        status === 'suspended' && "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
      )}>
        {status === 'pending' && <Clock className="w-3.5 h-3.5" />}
        {status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
        {status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
        {status === 'suspended' && <ShieldAlert className="w-3.5 h-3.5" />}
        {status.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
      </span>
    );
  };

  const serviceColumns = [
    { key: 'provider', header: 'Provider', render: (s: any) => <span className="font-medium text-foreground">{s.providerName || s.user?.username || 'Unknown'}</span> },
    { key: 'category', header: 'Category', render: (s: any) => s.category?.name || s.category || 'Service' },
    { key: 'rate', header: 'Hourly Rate', render: (s: any) => <span className="font-semibold">${s.hourlyRate || 0}/hr</span> },
    { key: 'location', header: 'Location', render: (s: any) => s.location || 'Unknown' },
    { key: 'status', header: 'Status', render: statusRender },
    { key: 'actions', header: 'Actions', render: (s: any) => (
      <button onClick={() => handleEdit(s)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-md hover:bg-primary/10"><Eye className="w-4 h-4" /></button>
    ) }
  ];

  const classifiedColumns = [
    { key: 'title', header: 'Ad Title', render: (c: any) => <span className="font-medium text-foreground">{c.title || 'Untitled'}</span> },
    { key: 'seller', header: 'Seller', render: (c: any) => c.seller?.username || c.sellerName || 'Guest' },
    { key: 'category', header: 'Category', render: (c: any) => c.category?.name || c.category || 'General' },
    { key: 'price', header: 'Price', render: (c: any) => <span className="font-semibold">${c.price || 0}</span> },
    { key: 'status', header: 'Status', render: statusRender },
    { key: 'actions', header: 'Actions', render: (c: any) => (
      <button onClick={() => handleEdit(c)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-md hover:bg-primary/10"><Eye className="w-4 h-4" /></button>
    ) }
  ];

  const isLoading = tab === 'services' ? servicesLoading : adsLoading;
  const error = tab === 'services' ? servicesError : adsError;
  const data = tab === 'services' ? services : classifieds;
  const columns = tab === 'services' ? serviceColumns : classifiedColumns;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Services & Classifieds</h1>
          <p className="text-muted-foreground">Moderate local service providers and C2C marketplace ads.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-px">
        <button
          onClick={() => setTab('services')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            tab === 'services' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          Local Services
        </button>
        <button
          onClick={() => setTab('classifieds')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            tab === 'classifieds' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          Classified Ads
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
        <DataTable data={data} columns={columns} title={tab === 'services' ? "Service Providers" : "Marketplace Ads"} />
      )}

      <AdModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} item={selectedItem} type={tab} />
    </div>
  );
}
