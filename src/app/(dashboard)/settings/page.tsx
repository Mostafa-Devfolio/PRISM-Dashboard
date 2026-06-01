'use client';
import { useState, useEffect } from 'react';
import { Save, Globe, Shield, Coins, Gift, Loader2, Edit2, Plus, Trash2, CheckCircle2, XCircle, Map } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { DataTable } from '@/components/ui/DataTable';
import { CurrencyModal } from '@/components/settings/CurrencyModal';
import { 
  useGetAuthSettingQuery, useUpdateAuthSettingMutation,
  useGetLoyaltySettingQuery, useUpdateLoyaltySettingMutation,
  useGetCurrenciesQuery, useDeleteCurrencyMutation
} from '@/store/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'auth' | 'loyalty' | 'currencies'>('auth');
  
  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Platform Settings</h1>
        <p className="font-medium text-muted-foreground">Manage global configurations, authentications, and currencies.</p>
      </div>

      <div className="flex border-b border-border">
        {[
          { id: 'auth', label: 'Auth & Maps', icon: Shield },
          { id: 'loyalty', label: 'Loyalty Program', icon: Gift },
          { id: 'currencies', label: 'Currencies', icon: Coins },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-6 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {activeTab === 'auth' && <AuthMapsSettings />}
        {activeTab === 'loyalty' && <LoyaltySettings />}
        {activeTab === 'currencies' && <CurrenciesSettings />}
      </div>
    </div>
  );
}

function AuthMapsSettings() {
  const { data, isLoading } = useGetAuthSettingQuery({});
  const [updateAuthSetting, { isLoading: isUpdating }] = useUpdateAuthSettingMutation();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (data?.data) {
      reset(data.data);
    }
  }, [data, reset]);

  const onSubmit = async (formData: any) => {
    try {
      await updateAuthSetting(formData).unwrap();
      toast.success('Auth & Map settings updated!');
    } catch (err: any) {
      toast.error('Failed to update settings');
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Authentication & OTP</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" {...register('otpEnabled')} className="w-4 h-4 rounded text-primary focus:ring-primary" />
            <span className="font-semibold">Enable OTP Verification</span>
          </label>

          <div>
            <label className="block text-sm font-semibold mb-1.5">OTP Channel</label>
            <select {...register('otpChannel')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Phone OTP Provider</label>
            <select {...register('phoneOtpProvider')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
              <option value="firebase">Firebase</option>
              <option value="twilio">Twilio</option>
              <option value="custom">Custom API</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">OTP Length</label>
            <input type="number" {...register('otpLength')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">OTP Expiry (Seconds)</label>
            <input type="number" {...register('otpExpiresSeconds')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Default Country (ISO2)</label>
            <input type="text" {...register('defaultCountryIso2')} placeholder="e.g. US, EG" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none uppercase" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
            <Map className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Mapping & Geolocation</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" {...register('mapEnabled')} className="w-4 h-4 rounded text-primary focus:ring-primary" />
            <span className="font-semibold">Enable Maps Integration</span>
          </label>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Map Provider</label>
            <select {...register('mapProvider')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
              <option value="google">Google Maps</option>
              <option value="mapbox">Mapbox</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1.5">Google Maps API Key</label>
            <input type="text" {...register('googleMapsApiKey')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1.5">Mapbox Access Token</label>
            <input type="text" {...register('mapboxAccessToken')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button disabled={isUpdating} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50">
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Auth & Maps Settings
        </button>
      </div>
    </form>
  );
}

function LoyaltySettings() {
  const { data, isLoading } = useGetLoyaltySettingQuery({});
  const [updateLoyaltySetting, { isLoading: isUpdating }] = useUpdateLoyaltySettingMutation();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (data?.data) reset(data.data);
  }, [data, reset]);

  const onSubmit = async (formData: any) => {
    try {
      await updateLoyaltySetting(formData).unwrap();
      toast.success('Loyalty settings updated!');
    } catch (err: any) {
      toast.error('Failed to update loyalty settings');
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg">
            <Gift className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Loyalty & Rewards Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" {...register('isEnabled')} className="w-4 h-4 rounded text-primary focus:ring-primary" />
            <span className="font-semibold text-lg">Enable Loyalty Program Globally</span>
          </label>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Earn Mode</label>
            <select {...register('earnMode')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
              <option value="percent">Percentage of Subtotal</option>
              <option value="fixed">Fixed Points Per Order</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1.5">Points Per Currency Unit ($1 = X points)</label>
            <input type="number" step="0.01" {...register('pointsPerCurrencyUnit')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Earn Percentage (%)</label>
            <input type="number" step="0.01" {...register('percent')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1.5">Fixed Points Amount</label>
            <input type="number" {...register('fixedPoints')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <label className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" {...register('includeTip')} className="w-4 h-4 rounded text-primary focus:ring-primary" />
            <span className="font-medium">Include Courier Tip in Points Calculation</span>
          </label>

          <div className="col-span-2 border-t border-border pt-4 mt-2">
            <h3 className="font-bold text-foreground mb-4">Wallet Withdrawals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center gap-2 md:col-span-2">
                <input type="checkbox" {...register('allowWithdraw')} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                <span className="font-medium">Allow customers to withdraw points to cash</span>
              </label>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5">Min Points to Convert to Wallet</label>
                <input type="number" {...register('minConvertPoints')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Min Points for Bank Withdrawal</label>
                <input type="number" {...register('minWithdrawPoints')} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button disabled={isUpdating} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50">
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Loyalty Settings
        </button>
      </div>
    </form>
  );
}

function CurrenciesSettings() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useGetCurrenciesQuery({ page, pageSize: 25 });
  const [deleteCurrency] = useDeleteCurrencyMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);

  const rawCurrencies = response?.data || [];
  const meta = response?.meta?.pagination;

  const handleEdit = (curr: any) => {
    setSelectedCurrency(curr);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCurrency(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this currency?')) {
      try {
        await deleteCurrency(id).unwrap();
        toast.success('Currency deleted');
      } catch (e) {
        toast.error('Failed to delete currency');
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Currency Name', render: (c: any) => (
      <div>
        <p className="font-bold text-foreground">{c.name}</p>
        <p className="text-xs text-muted-foreground">{c.code}</p>
      </div>
    )},
    { key: 'symbol', header: 'Format', render: (c: any) => (
      <span className="font-medium bg-muted px-2 py-1 rounded-md text-sm">
        {c.symbolPosition === 'before' ? `${c.symbol}1,000` : `1,000${c.symbol}`}
      </span>
    )},
    { key: 'decimals', header: 'Decimals', render: (c: any) => c.decimalPlaces },
    { key: 'status', header: 'Status', render: (c: any) => (
      <div className="flex gap-2">
        {c.isDefault && <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-bold rounded-md flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Default</span>}
        {c.isActive ? (
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold rounded-md">Active</span>
        ) : (
          <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-xs font-bold rounded-md">Inactive</span>
        )}
      </div>
    )},
    { key: 'actions', header: 'Actions', render: (c: any) => (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(c)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-md hover:bg-primary/10">
          <Edit2 className="w-4 h-4" />
        </button>
        {!c.isDefault && (
          <button onClick={() => handleDelete(c.documentId || c.id)} className="p-1.5 text-red-500 hover:text-red-600 transition-colors bg-red-500/10 rounded-md hover:bg-red-500/20">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" /> Currencies
          </h2>
          <p className="text-sm text-muted-foreground">Manage platform supported currencies</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Currency
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <DataTable 
          data={rawCurrencies} 
          columns={columns} 
          pagination={meta ? { page: meta.page, pageCount: meta.pageCount, onPageChange: setPage } : undefined}
        />
      )}

      {isModalOpen && (
        <CurrencyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currency={selectedCurrency} />
      )}
    </div>
  );
}
