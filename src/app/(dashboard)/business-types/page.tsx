'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useGetBusinessTypesQuery, useDeleteBusinessTypeMutation } from '@/store/api';
import { BusinessTypeModal } from '@/components/business-types/BusinessTypeModal';

export default function BusinessTypesPage() {
  const { data: response, isLoading, error } = useGetBusinessTypesQuery({});
  const [deleteBusinessType] = useDeleteBusinessTypeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);

  const businessTypes = response?.data || [];

  const handleAdd = () => {
    setSelectedType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (type: any) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this business type? This might affect vendors.')) {
      try {
        await deleteBusinessType(id).unwrap();
        alert('Deleted successfully');
      } catch (err) {
        console.error('Failed to delete:', err);
        alert('Failed to delete business type.');
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (t: any) => <span className="font-bold text-primary">{t.name}</span> },
    { key: 'slug', header: 'Slug' },
    { key: 'layoutType', header: 'Layout Type', render: (t: any) => <span className="capitalize">{t.layoutType}</span> },
    { key: 'orderMode', header: 'Order Mode', render: (t: any) => <span className="capitalize">{t.orderMode?.replace('_', ' ')}</span> },
    { key: 'status', header: 'Status', render: (t: any) => (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        t.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
      }`}>
        {t.isActive ? 'Active' : 'Inactive'}
      </span>
    ) },
    { key: 'actions', header: 'Actions', render: (t: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleEdit(t)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => handleDelete(t.documentId || t.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">System Modules & Business Types</h1>
          <p className="text-muted-foreground">Manage platform business models, layouts, and core modules.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Business Type
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading business types...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p>Failed to load business types.</p>
        </div>
      ) : (
        <DataTable 
          data={businessTypes} 
          columns={columns} 
          title="Configured Types"
          description={`Showing ${businessTypes.length} configured business types.`}
        />
      )}

      {isModalOpen && (
        <BusinessTypeModal 
          businessType={selectedType} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
