'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useGetUsersQuery, useDeleteUserMutation } from '@/store/api';
import { UserModal } from '@/components/users/UserModal';

export default function UsersPage() {
  const { data: users, isLoading, error } = useGetUsersQuery({});
  const [deleteUser] = useDeleteUserMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleAdd = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id).unwrap();
      } catch (err) {
        console.error('Failed to delete user:', err);
        alert('Failed to delete user.');
      }
    }
  };

  const columns = [
    { key: 'username', header: 'Username' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (u: any) => (
      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
        {u.role?.name || 'Authenticated'}
      </span>
    ) },
    { key: 'status', header: 'Status', render: (u: any) => (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        !u.blocked ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
      }`}>
        {!u.blocked ? 'Active' : 'Blocked'}
      </span>
    ) },
    { key: 'actions', header: 'Actions', render: (u: any) => (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleEdit(u)}
          className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleDelete(u.id)}
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage platform users, roles, and access.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading live users from Strapi...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p className="font-medium">Failed to load users. Ensure Strapi is running on port 1337.</p>
        </div>
      ) : (
        <DataTable 
          data={users || []} 
          columns={columns} 
          title="Live User Database" 
          description={`Showing ${users?.length || 0} registered users from Strapi.`}
        />
      )}

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={selectedUser} 
      />
    </div>
  );
}
