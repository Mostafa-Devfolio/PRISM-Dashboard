import Swal from 'sweetalert2';

export const showAlert = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'error') => {
  return Swal.fire({
    title,
    icon,
    confirmButtonColor: '#3b82f6',
    customClass: {
      popup: 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl',
      title: 'text-lg font-bold text-slate-900 dark:text-white',
      confirmButton: 'px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
    },
    background: '#ffffff',
    color: '#000000',
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
      popup: 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl',
      title: 'text-lg font-bold text-slate-900 dark:text-white',
      htmlContainer: 'text-sm text-slate-500 dark:text-slate-400',
      confirmButton: 'px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors',
      cancelButton: 'px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors',
    },
    background: '#ffffff',
    color: '#000000',
  });
  return result.isConfirmed;
};
