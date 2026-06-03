'use client';
import { showAlert, showConfirm } from '@/lib/custom-alerts';

import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Building2, Eye, MapPin, CheckCircle2, XCircle, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useGetPropertiesQuery, useDeletePropertyMutation } from '@/store/api';
import { PropertyModal } from '@/components/properties/PropertyModal';
import { cn } from '@/lib/utils';

export default function PropertiesPage() {
  const { data: response, isLoading, error } = useGetPropertiesQuery({});
  const [deleteProperty] = useDeletePropertyMutation();
  
  const [tab, setTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const rawProperties = response?.data || [];
  
  const filteredProperties = tab === 'all' 
    ? rawProperties 
    : rawProperties.filter((p: any) => {
        if (tab === 'published') return p.publishedAt !== null;
        if (tab === 'draft') return p.publishedAt === null;
        return true;
      });

  const handleEdit = (property: any) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProperty(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (await showConfirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await deleteProperty(id).unwrap();
      } catch (err: any) {
        showAlert(err.message || 'Failed to delete property.');
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Property Name', render: (p: any) => (
      <div>
        <p className="font-bold text-foreground">{p.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{p.propertyType || 'Unknown Type'}</p>
      </div>
    )},
    { key: 'location', header: 'Location', render: (p: any) => (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4 text-primary" />
        <span>{p.city || 'Unknown City'}, {p.country || 'Unknown Country'}</span>
      </div>
    )},
    { key: 'owner', header: 'Owner', render: (p: any) => {
      const owner = p.owner;
      if (!owner) return <span className="text-muted-foreground text-sm italic">Unassigned</span>;
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
            {owner.username?.charAt(0) || owner.email?.charAt(0) || 'O'}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{owner.username || 'Owner'}</p>
            <p className="text-xs text-muted-foreground">{owner.email}</p>
          </div>
        </div>
      );
    }},
    { key: 'status', header: 'Visibility Status', render: (p: any) => {
      const isPublished = p.publishedAt !== null;
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-md text-xs font-medium flex items-center w-fit gap-1.5",
          isPublished ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
        )}>
          {isPublished ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {isPublished ? 'Published (Live)' : 'Draft (Blocked/Hidden)'}
        </span>
      );
    }},
    { key: 'actions', header: 'Actions', render: (p: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleEdit(p)} title="Manage Property" className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-md hover:bg-primary/10">
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={() => handleDelete(p.documentId || p.id)} title="Delete Property" className="p-1.5 text-red-500 hover:text-red-600 transition-colors bg-red-500/10 rounded-md hover:bg-red-500/20">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Global Properties Management
          </h1>
          <p className="text-muted-foreground">Manage hotels, apartments, edit details, and securely transfer ownership.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto">
        {['all', 'published', 'draft'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {t === 'all' ? 'All Properties' : t === 'published' ? 'Live on Platform' : 'Blocked (Drafts)'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading properties from Strapi...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p className="font-medium">Failed to load properties. Check Strapi connection.</p>
        </div>
      ) : (
        <DataTable data={filteredProperties} columns={columns} title="Registered Properties" description={`${filteredProperties.length} properties found.`} />
      )}

      {isModalOpen && (
        <PropertyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} property={selectedProperty} />
      )}
    </div>
  );
}
