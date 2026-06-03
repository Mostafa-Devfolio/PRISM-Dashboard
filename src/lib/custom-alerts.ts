import Swal from 'sweetalert2';

export const showAlert = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'error') => {
  return Swal.fire({
    title,
    icon,
    confirmButtonColor: '#3b82f6',
    customClass: {
      popup: 'bg-card text-foreground border border-border rounded-xl shadow-2xl',
      title: 'text-lg font-bold text-foreground',
      confirmButton: 'px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors',
    },
    background: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
  });
};

export const showConfirm = async (title: string, text?: string) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'bg-card text-foreground border border-border rounded-xl shadow-2xl',
      title: 'text-lg font-bold text-foreground',
      htmlContainer: 'text-sm text-muted-foreground',
      confirmButton: 'px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors',
      cancelButton: 'px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors',
    },
    background: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
  });
  return result.isConfirmed;
};
