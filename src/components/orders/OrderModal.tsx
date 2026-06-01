'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Package, MapPin, CreditCard, Users, Store, Box, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUpdateOrderMutation, useUpdateSubOrderMutation } from '@/store/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const orderSchema = z.object({
  fulfillmentStatus: z.enum(['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'returned', 'cancelled']),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any | null;
}

export function OrderModal({ isOpen, onClose, order }: OrderModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'customer' | 'suborders'>('overview');
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();
  const [updateSubOrder, { isLoading: isUpdatingSubOrder }] = useUpdateSubOrderMutation();

  const { register, handleSubmit, reset } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      fulfillmentStatus: 'pending',
      status: 'pending'
    }
  });

  useEffect(() => {
    if (order) {
      reset({
        fulfillmentStatus: order.fulfillmentStatus || 'pending',
        status: order.status || 'pending',
      });
      setActiveTab('overview');
    }
  }, [order, reset, isOpen]);

  if (!isOpen || !order) return null;

  const onSubmit = async (data: OrderFormData) => {
    try {
      await updateOrder({ documentId: order.documentId || order.id, ...data }).unwrap();
      toast.success('Order overarching status updated successfully!');
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status.');
    }
  };

  const handleSubOrderStatusUpdate = async (subOrderId: string, newStatus: string) => {
    try {
      await updateSubOrder({ documentId: subOrderId, status: newStatus }).unwrap();
      toast.success('Sub-order status updated!');
    } catch (error) {
      console.error('Failed to update sub-order:', error);
      toast.error('Failed to update sub-order status.');
    }
  };

  const subOrders = order.subOrders || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6">
      <div className="bg-card w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Manage Order #{order.id}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex px-6 border-b border-border bg-card overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Finances', icon: CreditCard },
            { id: 'customer', label: 'Customer & Address', icon: Users },
            { id: 'suborders', label: 'Vendors & Sub-Orders', icon: Store },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" /> Financials (Read-Only)
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium uppercase">{order.paymentMethod?.replace(/_/g, ' ') || 'Unknown'}</span>
                    </div>
                    
                    <div className="border-t border-border pt-2 mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">${order.subtotal || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee:</span>
                        <span className="font-medium">${order.deliveryFee || 0}</span>
                      </div>
                      {(order.discount > 0) && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount:</span>
                          <span>-${order.discount}</span>
                        </div>
                      )}
                      {(order.tipAmount > 0) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tip Amount:</span>
                          <span className="font-medium">${order.tipAmount}</span>
                        </div>
                      )}
                      {(order.walletUsedAmount > 0) && (
                        <div className="flex justify-between text-red-500/80">
                          <span>Wallet Used:</span>
                          <span>-${order.walletUsedAmount}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
                      <span>Order Total:</span>
                      <span>${order.total || 0}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-primary">
                      <span>Amount Due:</span>
                      <span>${order.amountDue || 0}</span>
                    </div>
                  </div>
                  {order.returnRequested && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 rounded-lg text-sm flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <div>
                        <strong className="block mb-1">Return Requested!</strong>
                        <p>Customer has opened a return request for this order. Please review the sub-orders.</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                  <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" /> Global Order Status
                  </h3>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Fulfillment Status</label>
                      <select 
                        {...register('fulfillmentStatus')}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-foreground"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="returned">Returned</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">This drives the customer-facing tracking timeline.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Internal Status</label>
                      <select 
                        {...register('status')}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-foreground"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={isUpdatingOrder}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        {isUpdatingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Global Status
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          )}
          {activeTab === 'customer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2 mb-4">
                  <Users className="w-4 h-4 text-muted-foreground" /> Customer Details
                </h3>
                <div className="space-y-3 text-sm">
                  {order.user ? (
                    <>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Username</span>
                        <span className="font-medium text-foreground">{order.user.username}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Email</span>
                        <span className="font-medium text-foreground">{order.user.email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Phone Number</span>
                        <span className="font-medium text-foreground">{order.user.phoneNumber || 'Not provided'}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground italic">Guest checkout or user deleted.</div>
                  )}
                  {order.recipientName && (
                    <div className="pt-2 mt-2 border-t border-border">
                      <span className="text-muted-foreground block mb-0.5">Recipient Name (Checkout)</span>
                      <span className="font-medium text-foreground">{order.recipientName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                <h3 className="font-semibold flex items-center gap-2 border-b border-border pb-2 mb-4">
                  <MapPin className="w-4 h-4 text-muted-foreground" /> Delivery Address
                </h3>
                {order.address ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Street</span>
                      <span className="font-medium text-foreground">{order.address.street} {order.address.streetNumber}</span>
                    </div>
                    {order.address.building && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Building / Floor / Apt</span>
                        <span className="font-medium text-foreground">{order.address.building}, {order.address.floor}, {order.address.apartment}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground block mb-0.5">City & Country</span>
                      <span className="font-medium text-foreground">{order.address.city}, {order.address.country}</span>
                    </div>
                    {order.address.additionalDirections && (
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Directions</span>
                        <span className="font-medium text-foreground">{order.address.additionalDirections}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">No address provided.</div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'suborders' && (
            <div className="space-y-6">
              {subOrders.length === 0 ? (
                <div className="text-center p-12 bg-card rounded-xl border border-border text-muted-foreground">
                  No sub-orders found.
                </div>
              ) : (
                subOrders.map((sub: any, idx: number) => (
                  <div key={sub.id || idx} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="bg-muted/30 p-4 border-b border-border flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                          {sub.vendor?.logo?.url ? (
                            <img 
                              src={sub.vendor.logo.url.startsWith('http') ? sub.vendor.logo.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') || 'https://pyramid.devfolio.net'}${sub.vendor.logo.url}`}
                              alt={sub.vendor.name}
                              className="object-cover w-full h-full"
                            />
                          ) : <Store className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{sub.vendor?.name || 'In-House Fulfillment'}</h4>
                          <p className="text-xs text-muted-foreground">Sub-Order ID: {sub.documentId || sub.id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <label className="text-xs text-muted-foreground block mb-1">Vendor Status</label>
                          <select
                            defaultValue={sub.status || 'pending'}
                            onChange={(e) => handleSubOrderStatusUpdate(sub.documentId || sub.id, e.target.value)}
                            disabled={isUpdatingSubOrder}
                            className="px-2 py-1.5 text-xs bg-background border border-border rounded-md font-medium text-foreground focus:ring-primary/50"
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="processing">Processing</option>
                            <option value="ready_for_pickup">Ready for Pickup</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-1 border-r border-border pr-4">
                        <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Delivery Assigned
                        </h5>
                        {sub.deliveryMan ? (
                          <div className="text-sm">
                            <p className="font-medium text-foreground">{sub.deliveryMan.username}</p>
                            <p className="text-muted-foreground text-xs mt-0.5">{sub.deliveryMan.phone || sub.deliveryMan.email}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Pending assignment</p>
                        )}
                      </div>
                      <div className="lg:col-span-3">
                        <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                          <Box className="w-3.5 h-3.5" /> Ordered Items ({sub.items?.length || 0})
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                              <tr>
                                <th className="px-3 py-2 font-medium rounded-l-md">Item</th>
                                <th className="px-3 py-2 font-medium">Variant</th>
                                <th className="px-3 py-2 font-medium text-center">Qty</th>
                                <th className="px-3 py-2 font-medium text-right rounded-r-md">Price</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {sub.items?.map((item: any, iIdx: number) => {
                                const variantDisplay = item.selectedOptions 
                                  ? (typeof item.selectedOptions === 'object' ? Object.values(item.selectedOptions).join(', ') : item.selectedOptions)
                                  : (item.skuSnapshot || '-');
                                  
                                return (
                                  <tr key={item.id || iIdx} className="hover:bg-muted/30">
                                    <td className="px-3 py-2.5">
                                      <span className="font-medium text-foreground line-clamp-1">
                                        {item.titleSnapshot || item.product?.title || 'Unknown Product'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-muted-foreground">
                                      {variantDisplay !== '-' ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs whitespace-nowrap truncate max-w-[150px]">
                                          {variantDisplay}
                                        </span>
                                      ) : '-'}
                                    </td>
                                    <td className="px-3 py-2.5 font-medium text-center">{item.quantity || 1}</td>
                                    <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">${item.unitPriceSnapshot || 0}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}

        </div>
        <div className="p-4 border-t border-border bg-card flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
