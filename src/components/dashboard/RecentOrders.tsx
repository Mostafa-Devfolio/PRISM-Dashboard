export function RecentOrders({ orders }: { orders?: any[] }) {
  // Sort by ID descending implicitly by reversing, or just take first 5
  const displayOrders = [...(orders || [])].reverse().slice(0, 5);

  return (
    <div className="p-6 bg-white dark:bg-black/40 border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm col-span-2 lg:col-span-2">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Latest live transactions</p>
      </div>
      <div className="space-y-4">
        {displayOrders.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-black/60 rounded-xl">
            <p className="text-sm font-bold text-slate-500">No recent orders found on the server.</p>
          </div>
        ) : displayOrders.map((order: any) => (
          <div key={order.id || order.documentId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/60 rounded-xl hover:bg-slate-100 dark:hover:bg-black/80 transition-colors">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">ORD-{order.id}</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {order.customer?.username || order.customerName || 'Guest User'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900 dark:text-white">${order.total || order.amount || '0.00'}</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold mt-1.5 inline-block ${
                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                order.status === 'processing' || order.status === 'pending' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
              }`}>
                {(order.status || 'Pending').toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
