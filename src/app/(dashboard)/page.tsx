'use client';
import { useState, useMemo } from 'react';
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { RevenuePieChart } from "@/components/dashboard/RevenuePieChart";
import { DollarSign, Users, ShoppingCart, Truck, Loader2 } from "lucide-react";
import { useGetOrdersQuery, useGetUsersQuery, useGetRidesQuery, useGetParcelsQuery, useGetBookingsQuery } from "@/store/api";

type Timeframe = '1d' | '3d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'all';

function getCutoffDate(tf: Timeframe): Date | null {
  if (tf === 'all') return null;
  const d = new Date();
  if (tf === '1d') d.setDate(d.getDate() - 1);
  else if (tf === '3d') d.setDate(d.getDate() - 3);
  else if (tf === '1w') d.setDate(d.getDate() - 7);
  else if (tf === '1m') d.setDate(d.getDate() - 30);
  else if (tf === '3m') d.setDate(d.getDate() - 90);
  else if (tf === '6m') d.setDate(d.getDate() - 180);
  else if (tf === '1y') d.setDate(d.getDate() - 365);
  return d;
}

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('all');

  const { data: ordersRes, isLoading: ordersLoading } = useGetOrdersQuery({ pageSize: 1000 });
  const { data: usersRes, isLoading: usersLoading } = useGetUsersQuery({ pageSize: 1000 });
  const { data: ridesRes, isLoading: ridesLoading } = useGetRidesQuery({ pageSize: 1000 });
  const { data: parcelsRes, isLoading: parcelsLoading } = useGetParcelsQuery({ pageSize: 1000 });
  const { data: bookingsRes, isLoading: bookingsLoading } = useGetBookingsQuery({ pageSize: 1000 });

  if (ordersLoading || usersLoading || ridesLoading || parcelsLoading || bookingsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
         <Loader2 className="w-10 h-10 animate-spin text-primary" />
         <p className="font-bold text-muted-foreground">Syncing live analytics from server...</p>
      </div>
    );
  }

  const rawOrders = ordersRes?.data || [];
  const rawRides = ridesRes?.data || [];
  const rawParcels = parcelsRes?.data || [];
  const rawBookings = bookingsRes?.data || [];
  const rawUsers = usersRes?.data || [];

  const cutoff = getCutoffDate(timeframe);

  const filterByDate = (arr: any[]) => {
    if (!cutoff) return arr;
    return arr.filter(item => {
      if (!item.createdAt) return false;
      return new Date(item.createdAt) >= cutoff;
    });
  };

  const safeOrders = filterByDate(rawOrders);
  const safeRides = filterByDate(rawRides);
  const safeParcels = filterByDate(rawParcels);
  const safeBookings = filterByDate(rawBookings);
  const safeUsers = filterByDate(rawUsers);

  // Compute Module Revenues
  const orderRev = safeOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || Number(o.amount) || 0), 0);
  const rideRev = safeRides.reduce((sum: number, r: any) => sum + (Number(r.finalPrice) || Number(r.recommendedPrice) || 0), 0);
  const parcelRev = safeParcels.reduce((sum: number, p: any) => sum + (Number(p.deliveryFee) || 0), 0);
  const bookingRev = safeBookings.reduce((sum: number, b: any) => sum + (Number(b.totalAmount) || 0), 0);
  
  const totalRevenue = orderRev + rideRev + parcelRev + bookingRev;

  const pieData = [
    { name: 'E-commerce', value: orderRev },
    { name: 'Passenger Rides', value: rideRev },
    { name: 'Parcel Delivery', value: parcelRev },
    { name: 'Property Bookings', value: bookingRev },
  ];

  // Prepare monthly data for SalesChart (Unfiltered, or filtered? Let's use filtered for consistency, but the chart is inherently a timeline. If they pick "1 Week", the chart will just show this month's partial bar. Let's filter the chart too.)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap: Record<string, number> = {};
  
  // Initialize last 6 months so chart always has width
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap[`${monthNames[d.getMonth()]} ${d.getFullYear()}`] = 0;
  }

  // Helper to add revenue by month
  const addRev = (item: any, amt: number) => {
    if (!item.createdAt) return;
    const d = new Date(item.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (monthlyMap[key] !== undefined) {
      monthlyMap[key] += amt;
    }
  };

  safeOrders.forEach((o: any) => addRev(o, Number(o.total) || Number(o.amount) || 0));
  safeRides.forEach((r: any) => addRev(r, Number(r.finalPrice) || Number(r.recommendedPrice) || 0));
  safeParcels.forEach((p: any) => addRev(p, Number(p.deliveryFee) || 0));
  safeBookings.forEach((b: any) => addRev(b, Number(b.totalAmount) || 0));

  const salesData = Object.keys(monthlyMap).map(key => ({
    name: key.split(' ')[0],
    total: monthlyMap[key]
  }));

  const activeOrders = safeOrders.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const activeRides = safeRides.filter((r: any) => r.status === 'in_progress' || r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="font-medium text-muted-foreground">Welcome back to Pyramids Admin. Live data is actively syncing.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Timeframe:</span>
          <select 
            value={timeframe} 
            onChange={e => setTimeframe(e.target.value as Timeframe)}
            className="bg-card border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="3d">Last 3 Days</option>
            <option value="1w">Last 1 Week</option>
            <option value="1m">Last 1 Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 1 Year</option>
            <option value="all">Full Time</option>
          </select>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
          icon={<DollarSign className="w-5 h-5" />} 
          trend={12.5} 
        />
        <StatCard 
          title="Active Orders" 
          value={activeOrders.toString()} 
          icon={<ShoppingCart className="w-5 h-5" />} 
          trend={5.2} 
        />
        <StatCard 
          title="Active Rides" 
          value={activeRides.toString()} 
          icon={<Truck className="w-5 h-5" />} 
          trend={2.1} 
        />
        <StatCard 
          title="Total Users" 
          value={safeUsers.length.toString()} 
          icon={<Users className="w-5 h-5" />} 
          trend={8.4} 
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
        <SalesChart data={salesData} />
        <RevenuePieChart data={pieData} />
      </div>

      <div className="grid gap-6 grid-cols-1">
        <RecentOrders orders={safeOrders} />
      </div>
    </div>
  );
}
