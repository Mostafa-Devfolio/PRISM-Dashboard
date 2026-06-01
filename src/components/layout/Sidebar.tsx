'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, ShoppingCart, Truck, 
  MapPin, Calendar, MessageSquare, Settings, Bus, Store, Package, LogOut, Briefcase, Building2, Grid, PieChart
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

const menuItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Reports & Analytics', href: '/reports', icon: PieChart },
  { name: 'Users & Roles', href: '/users', icon: Users },
  { name: 'Business Types', href: '/business-types', icon: Briefcase },
  { name: 'Vendor Approvals', href: '/vendors', icon: Store },
  { name: 'E-commerce', href: '/orders', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: Grid },
  { name: 'Rides & Parcels', href: '/logistics', icon: Truck },
  { name: 'Bus Trips', href: '/bus-trips', icon: Bus },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Classified Ads', href: '/ads', icon: MapPin },
  { name: 'Messages', href: '/chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col transition-all duration-300 dark:bg-black/95">
      <div className="h-16 flex items-center px-6 border-b border-white/10 dark:border-white/5">
        <h1 className="text-xl font-black tracking-tight">Pyramids<span className="text-blue-500">Admin</span></h1>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 dark:bg-blue-600/90' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/10 flex flex-col gap-4">
        <div className="text-xs text-slate-500 pl-1">
          © 2026 Pyramids
        </div>
      </div>
    </aside>
  );
}
