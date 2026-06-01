'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useGetProductsQuery, useDeleteProductMutation } from '@/store/api';
import { ProductModal } from '@/components/products/ProductModal';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, error } = useGetProductsQuery({ page, pageSize: 25 });
  const [deleteProduct] = useDeleteProductMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const products = response?.data || [];
  const meta = response?.meta?.pagination;

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(documentId).unwrap();
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product.');
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Product Name', render: (p: any) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-muted rounded-md flex-shrink-0 border border-border"></div>
        <span className="font-medium text-foreground">{p.title || p.name}</span>
      </div>
    ) },
    { key: 'category', header: 'Category', render: (p: any) => p.category?.name || 'Uncategorized' },
    { key: 'vendor', header: 'Vendor', render: (p: any) => p.vendor?.name || 'In-House' },
    { key: 'price', header: 'Price', render: (p: any) => <span className="font-semibold">${p.basePrice || p.price}</span> },
    { key: 'stock', header: 'Stock', render: (p: any) => (
      <span className={p.stock > 0 ? "text-foreground" : "text-red-500 font-medium"}>
        {p.stock} units
      </span>
    ) },
    { key: 'status', header: 'Status', render: (p: any) => {
      const isActive = p.isActive !== false;
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }`}>
          {isActive ? 'Active' : 'Draft'}
        </span>
      );
    } },
    { key: 'actions', header: 'Actions', render: (p: any) => (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleEdit(p)}
          className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleDelete(p.documentId)}
          className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Products & Inventory</h1>
          <p className="text-muted-foreground">Manage global product catalogs and vendor inventory.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading products from Strapi...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p className="font-medium">Failed to load products. Check Strapi server connection.</p>
        </div>
      ) : (
        <DataTable 
          data={products} 
          columns={columns} 
          title="Live Product Catalog"
          description={meta ? `Showing page ${meta.page} of ${meta.pageCount} (${meta.total} total products).` : `${products.length} active products.`}
          pagination={meta ? { page: meta.page, pageCount: meta.pageCount, onPageChange: setPage } : undefined}
        />
      )}

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
