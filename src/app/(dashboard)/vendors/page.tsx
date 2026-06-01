'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { CheckCircle, XCircle, Eye, Loader2, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import { useGetVendorsQuery, useUpdateVendorMutation, useDeleteVendorMutation } from '@/store/api';
import { VendorModal } from '@/components/vendors/VendorModal';
import { cn } from '@/lib/utils';

export default function VendorsPage() {
  const [tab, setTab] = useState('pending');
  const [page, setPage] = useState(1);
  
  const { data: response, isLoading, error } = useGetVendorsQuery({ page, pageSize: 25 });
  const [updateVendor] = useUpdateVendorMutation();
  const [deleteVendor] = useDeleteVendorMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const rawVendors = response?.data || [];
  
  const pendingVendors = rawVendors.filter((v: any) => v.isActive === false);
  const filteredVendors = tab === 'pending' ? pendingVendors : rawVendors;
  
  const meta = response?.meta?.pagination;

  const handleApprove = async (vendor: any) => {
    if (confirm(`Are you sure you want to approve ${vendor.name}?`)) {
      try {
        await updateVendor({ documentId: vendor.documentId || vendor.id, isActive: true }).unwrap();
        alert('Vendor approved successfully!');
      } catch (err) {
        console.error('Failed to approve vendor:', err);
        alert('Failed to approve vendor.');
      }
    }
  };

  const handleReject = async (vendor: any) => {
    if (confirm(`Are you sure you want to reject and delete ${vendor.name}?`)) {
      try {
        await deleteVendor(vendor.documentId || vendor.id).unwrap();
      } catch (err) {
        console.error('Failed to reject vendor:', err);
        alert('Failed to reject vendor.');
      }
    }
  };

  const handleCreate = () => {
    setSelectedVendor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const columns = [
    { key: 'name', header: 'Vendor Name', render: (v: any) => <span className="font-medium text-foreground">{v.name}</span> },
    { key: 'owner', header: 'Owner', render: (v: any) => v.owner?.username || v.owner?.email || 'N/A' },
    { key: 'type', header: 'Business Type', render: (v: any) => v.businessType?.name || 'Uncategorized' },
    { key: 'status', header: 'Status', render: (v: any) => (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        v.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
      }`}>
        {v.isActive ? 'Active' : 'Pending Approval'}
      </span>
    ) },
    { key: 'actions', header: 'Actions', render: (v: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleEdit(v)} title="Manage Vendor" className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-md hover:bg-primary/10">
          <Edit2 className="w-4 h-4" />
        </button>
        {!v.isActive && (
          <>
            <button onClick={() => handleApprove(v)} title="Approve" className="p-1.5 text-emerald-500 hover:text-emerald-600 transition-colors">
              <CheckCircle className="w-4 h-4" />
            </button>
            <button onClick={() => handleReject(v)} title="Reject & Delete" className="p-1.5 text-red-500 hover:text-red-600 transition-colors">
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    ) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendors & Partners</h1>
          <p className="text-muted-foreground">Manage vendor applications, settings, and business details.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-px">
        <button
          onClick={() => { setTab('pending'); setPage(1); }}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            tab === 'pending' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Pending Approvals
          {pendingVendors.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-bold">
              {pendingVendors.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setTab('all'); setPage(1); }}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            tab === 'all' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          All Vendors
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading vendors...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p>Failed to load vendors.</p>
        </div>
      ) : (
        <DataTable 
          data={filteredVendors} 
          columns={columns} 
          title={tab === 'pending' ? "Pending Applications" : "All Vendors Database"} 
          description={tab === 'pending' ? "Verify business documents before approving." : `Showing all ${meta?.total || filteredVendors.length} vendors.`}
          pagination={meta ? { page: meta.page, pageCount: meta.pageCount, onPageChange: setPage } : undefined}
        />
      )}

      {isModalOpen && (
        <VendorModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          vendor={selectedVendor}
        />
      )}
    </div>
  );
}
