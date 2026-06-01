'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, Search, UserCircle, LogOut, Settings, ChevronDown, Package } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/store/slices/authSlice';
import { useGetMeQuery, useGetOrdersQuery } from '@/store/api';
import { AdminAccountModal } from './AdminAccountModal';
import { OrderModal } from '@/components/orders/OrderModal';

function formatRelativeTime(dateString: string) {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useDispatch();
  const router = useRouter();

  const { data: user } = useGetMeQuery(undefined, { skip: false });
  const { data: ordersResponse } = useGetOrdersQuery({ page: 1, pageSize: 5 }, { pollingInterval: 30000 });
  
  const recentOrders = (ordersResponse?.data || []).slice(0, 5);
  const newOrders = recentOrders.filter((o: any) => o.status === 'pending' || o.fulfillmentStatus === 'pending');
  const unreadCount = newOrders.length;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex-1 flex items-center">
        <div className="relative w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </span>
          <input
            type="text"
            className="w-full bg-muted border-none rounded-md py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Search..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card animate-pulse"></span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-border/50 flex justify-between items-center bg-muted/30">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                {unreadCount > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {recentOrders.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No recent orders.
                  </div>
                ) : (
                  recentOrders.map((order: any) => {
                    const isNew = order.status === 'pending' || order.fulfillmentStatus === 'pending';
                    return (
                      <button
                        key={order.id}
                        onClick={() => {
                          setSelectedOrder(order);
                          setNotifOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${isNew ? 'bg-primary/5' : ''}`}
                      >
                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isNew ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            New Order #{order.id}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {order.user?.username || 'Guest'} placed an order
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1.5">
                            {formatRelativeTime(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-foreground">${order.amountDue || order.total}</p>
                          {isNew && <span className="inline-block w-2 h-2 rounded-full bg-primary mt-2"></span>}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
              <div className="p-2 border-t border-border/50 bg-muted/10">
                <button 
                  onClick={() => { setNotifOpen(false); router.push('/orders'); }}
                  className="w-full py-1.5 text-xs text-primary font-medium hover:underline text-center"
                >
                  View All Orders
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 cursor-pointer p-1.5 pr-2 rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border"
          >
            <UserCircle className="h-8 w-8 text-primary" />
            <div className="flex flex-col text-sm hidden sm:block">
              <span className="font-medium text-foreground">{user?.username || 'Admin User'}</span>
              <span className="text-xs text-muted-foreground text-left">{user?.email || 'Superadmin'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-1 hidden sm:block" />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-border/50 mb-1">
                <p className="text-sm font-semibold text-foreground">My Account</p>
              </div>
              <button 
                onClick={() => {
                  setDropdownOpen(false);
                  setAccountModalOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center transition-colors"
              >
                <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                Edit Account
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {accountModalOpen && (
        <AdminAccountModal 
          user={user} 
          onClose={() => setAccountModalOpen(false)} 
        />
      )}

      {selectedOrder && (
        <OrderModal 
          isOpen={!!selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          order={selectedOrder} 
        />
      )}
    </header>
  );
}
