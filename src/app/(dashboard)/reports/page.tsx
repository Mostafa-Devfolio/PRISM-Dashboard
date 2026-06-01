'use client';
import { useState } from 'react';
import { useGetOrdersQuery, useGetUsersQuery, useGetRidesQuery, useGetParcelsQuery, useGetBookingsQuery, useGetVendorsQuery } from "@/store/api";
import { Loader2, DollarSign, Users, Truck, Store, AlertCircle } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

export default function ReportsPage() {
  const [tab, setTab] = useState<'financial' | 'users' | 'logistics' | 'vendors'>('financial');
  const [timeframe, setTimeframe] = useState<Timeframe>('all');

  // Fetch massive sets of data for analytics
  const { data: ordersRes, isLoading: oLoading } = useGetOrdersQuery({ pageSize: 1000 });
  const { data: usersRes, isLoading: uLoading } = useGetUsersQuery({ pageSize: 1000 });
  const { data: ridesRes, isLoading: rLoading } = useGetRidesQuery({ pageSize: 1000 });
  const { data: parcelsRes, isLoading: pLoading } = useGetParcelsQuery({ pageSize: 1000 });
  const { data: bookingsRes, isLoading: bLoading } = useGetBookingsQuery({ pageSize: 1000 });
  const { data: vendorsRes, isLoading: vLoading } = useGetVendorsQuery({ pageSize: 1000 });

  if (oLoading || uLoading || rLoading || pLoading || bLoading || vLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
         <Loader2 className="w-10 h-10 animate-spin text-primary" />
         <p className="font-bold text-muted-foreground">Aggregating thousands of data points...</p>
      </div>
    );
  }

  const rawOrders = ordersRes?.data || [];
  const rawRides = ridesRes?.data || [];
  const rawParcels = parcelsRes?.data || [];
  const rawBookings = bookingsRes?.data || [];
  const rawUsers = usersRes?.data || [];
  const rawVendors = vendorsRes?.data || [];

  const cutoff = getCutoffDate(timeframe);

  const filterByDate = (arr: any[]) => {
    if (!cutoff) return arr;
    return arr.filter(item => {
      if (!item.createdAt) return false;
      return new Date(item.createdAt) >= cutoff;
    });
  };

  const orders = filterByDate(rawOrders);
  const rides = filterByDate(rawRides);
  const parcels = filterByDate(rawParcels);
  const bookings = filterByDate(rawBookings);
  const users = filterByDate(rawUsers);
  const vendors = filterByDate(rawVendors);

  // --- Financial Calculations ---
  const orderRev = orders.reduce((sum: number, o: any) => sum + (Number(o.total) || Number(o.amount) || 0), 0);
  const rideRev = rides.reduce((sum: number, r: any) => sum + (Number(r.finalPrice) || Number(r.recommendedPrice) || 0), 0);
  const parcelRev = parcels.reduce((sum: number, p: any) => sum + (Number(p.deliveryFee) || 0), 0);
  const bookingRev = bookings.reduce((sum: number, b: any) => sum + (Number(b.totalAmount) || 0), 0);
  const totalRevenue = orderRev + rideRev + parcelRev + bookingRev;
  const aov = orders.length > 0 ? (orderRev / orders.length).toFixed(2) : '0.00';

  // Monthly Revenue Line
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap[`${monthNames[d.getMonth()]} ${d.getFullYear()}`] = 0;
  }
  const addRev = (item: any, amt: number) => {
    if (!item.createdAt) return;
    const d = new Date(item.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (monthlyMap[key] !== undefined) monthlyMap[key] += amt;
  };
  orders.forEach((o: any) => addRev(o, Number(o.total) || Number(o.amount) || 0));
  rides.forEach((r: any) => addRev(r, Number(r.finalPrice) || Number(r.recommendedPrice) || 0));
  parcels.forEach((p: any) => addRev(p, Number(p.deliveryFee) || 0));
  bookings.forEach((b: any) => addRev(b, Number(b.totalAmount) || 0));
  const financialData = Object.keys(monthlyMap).map(key => ({ name: key, revenue: monthlyMap[key] }));

  // --- User Calculations ---
  const usersWithKyc = users.filter((u: any) => u.kycVerified).length;
  const usersNoKyc = users.length - usersWithKyc;
  const kycPie = [
    { name: 'Verified', value: usersWithKyc },
    { name: 'Unverified', value: usersNoKyc }
  ];

  const userRoles: Record<string, number> = {};
  users.forEach((u: any) => {
    const roleName = u.role?.name || 'Customer';
    userRoles[roleName] = (userRoles[roleName] || 0) + 1;
  });
  const rolePie = Object.keys(userRoles).map(k => ({ name: k, value: userRoles[k] }));

  // --- Logistics Calculations ---
  const rideStatuses: Record<string, number> = {};
  rides.forEach((r: any) => {
    const s = r.status || 'unknown';
    rideStatuses[s] = (rideStatuses[s] || 0) + 1;
  });
  const ridePie = Object.keys(rideStatuses).map(k => ({ name: k, value: rideStatuses[k] }));

  const parcelStatuses: Record<string, number> = {};
  parcels.forEach((p: any) => {
    const s = p.deliveryStatus || p.status || 'unknown';
    parcelStatuses[s] = (parcelStatuses[s] || 0) + 1;
  });
  const parcelPie = Object.keys(parcelStatuses).map(k => ({ name: k, value: parcelStatuses[k] }));

  // --- Vendor Calculations ---
  const vendorStatuses: Record<string, number> = {};
  vendors.forEach((v: any) => {
    const s = v.isActive ? 'Active' : 'Pending';
    vendorStatuses[s] = (vendorStatuses[s] || 0) + 1;
  });
  const vendorPie = Object.keys(vendorStatuses).map(k => ({ name: k, value: vendorStatuses[k] }));


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive system-wide performance and metrics.</p>
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

      <div className="flex space-x-2 border-b border-border overflow-x-auto pb-px">
        <button onClick={() => setTab('financial')} className={cn("px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap", tab === 'financial' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <DollarSign className="w-4 h-4" /> Financials
        </button>
        <button onClick={() => setTab('users')} className={cn("px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap", tab === 'users' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Users className="w-4 h-4" /> Users Growth
        </button>
        <button onClick={() => setTab('logistics')} className={cn("px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap", tab === 'logistics' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Truck className="w-4 h-4" /> Logistics
        </button>
        <button onClick={() => setTab('vendors')} className={cn("px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap", tab === 'vendors' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Store className="w-4 h-4" /> Vendors
        </button>
      </div>

      {tab === 'financial' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Total Processed Volume</p>
              <h2 className="text-3xl font-bold mt-2">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">E-commerce AOV</p>
              <h2 className="text-3xl font-bold mt-2">${aov}</h2>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
              <h2 className="text-3xl font-bold mt-2">{orders.length + rides.length + parcels.length + bookings.length}</h2>
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl h-[400px] shadow-sm">
            <h3 className="text-lg font-bold mb-4">Gross Volume Trajectory (6 Months)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border p-6 rounded-xl h-[350px] shadow-sm">
              <h3 className="text-lg font-bold mb-4">KYC Verification Status</h3>
              {users.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={kycPie} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                      {kycPie.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-center mt-10">No user data available for this timeframe.</p>}
            </div>
            <div className="bg-card border border-border p-6 rounded-xl h-[350px] shadow-sm">
              <h3 className="text-lg font-bold mb-4">Users by Role</h3>
              {users.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rolePie}>
                    <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-center mt-10">No user data available for this timeframe.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'logistics' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border p-6 rounded-xl h-[350px] shadow-sm">
              <h3 className="text-lg font-bold mb-4">Ride Completion Status</h3>
              {ridePie.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ridePie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {ridePie.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-center mt-10">No ride data available for this timeframe.</p>}
            </div>
            <div className="bg-card border border-border p-6 rounded-xl h-[350px] shadow-sm">
              <h3 className="text-lg font-bold mb-4">Parcel Delivery Status</h3>
              {parcelPie.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={parcelPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {parcelPie.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-center mt-10">No parcel data available for this timeframe.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'vendors' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border p-6 rounded-xl h-[350px] shadow-sm">
              <h3 className="text-lg font-bold mb-4">Vendor Onboarding</h3>
              {vendorPie.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={vendorPie} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                      {vendorPie.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-center mt-10">No vendor data available for this timeframe.</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
