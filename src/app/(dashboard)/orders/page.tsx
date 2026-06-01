'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Eye, Clock, CheckCircle2, XCircle, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetOrdersQuery } from '@/store/api';
import { OrderModal } from '@/components/orders/OrderModal';

export default function OrdersPage() {
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: response, isLoading, error } = useGetOrdersQuery({ page, pageSize: 25 });
  
  // Safely extract array whether wrapped in data or not
  const rawOrders = response?.data || [];
  const meta = response?.meta?.pagination;
  
  const filteredOrders = tab === 'all' 
    ? rawOrders 
    : rawOrders.filter((o: any) => o.fulfillmentStatus === tab);

  const handleEdit = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const columns = [
    { key: 'id', header: 'Order ID', render: (o: any) => <span className="font-medium text-primary">#{o.id}</span> },
    { key: 'date', header: 'Date', render: (o: any) => new Date(o.createdAt || Date.now()).toLocaleDateString() },
    { key: 'customer', header: 'Customer', render: (o: any) => o.user?.username || o.recipientName || 'Guest' },
    { key: 'vendor', header: 'Vendor (Sub-order)', render: (o: any) => o.vendor?.name || 'In-House' },
    { key: 'total', header: 'Total Amount', render: (o: any) => <span className="font-semibold">${o.total || 0}</span> },
    { key: 'status', header: 'Status', render: (o: any) => {
      const status = o.fulfillmentStatus || 'pending';
      const isPending = status === 'pending';
      const isOut = status === 'out_for_delivery';
      const isDelivered = status === 'delivered';
      
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-md text-xs font-medium flex items-center w-fit gap-1.5",
          isPending && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
          isOut && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
          isDelivered && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
          !isPending && !isOut && !isDelivered && "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
        )}>
          {isPending && <Clock className="w-3.5 h-3.5" />}
          {isOut && <RefreshCw className="w-3.5 h-3.5" />}
          {isDelivered && <CheckCircle2 className="w-3.5 h-3.5" />}
          {(!isPending && !isOut && !isDelivered) && <XCircle className="w-3.5 h-3.5" />}
          {status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
        </span>
      );
    } },
    { key: 'actions', header: 'Actions', render: (o: any) => (
      <button 
        onClick={() => handleEdit(o)}
        title="Update Status" 
        className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-md hover:bg-primary/10"
      >
        <Eye className="w-4 h-4" />
      </button>
    ) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage global e-commerce orders and sub-orders.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto">
        {['all', 'pending', 'processing', 'out_for_delivery', 'delivered', 'returned', 'cancelled'].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              tab === t 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {t === 'all' ? 'All Orders' : t.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading live orders from Strapi...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p className="font-medium">Failed to load orders. Check Strapi server connection.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* <div className="p-4 bg-muted text-xs font-mono overflow-auto rounded-md">
            <p className="font-bold mb-2">DEBUG INFO (What the API actually returned):</p>
            {JSON.stringify(orders || 'undefined', null, 2)}
          </div> */}
          <DataTable 
            data={filteredOrders} 
            columns={columns} 
            title="Live Orders Database"
            description={meta ? `Showing page ${meta.page} of ${meta.pageCount} (${meta.total} total orders)` : `Showing ${filteredOrders.length} orders.`}
            pagination={meta ? { page: meta.page, pageCount: meta.pageCount, onPageChange: setPage } : undefined}
          />
        </div>
      )}

      <OrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}
