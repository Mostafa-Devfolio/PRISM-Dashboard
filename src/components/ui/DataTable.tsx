import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;
  action?: ReactNode;
  pagination?: {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T extends { id: string | number }>({ data, columns, title, description, action, pagination }: DataTableProps<T>) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {(title || description || action) && (
        <div className="p-6 flex items-center justify-between border-b border-border">
          <div>
            {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 font-medium tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-foreground break-words max-w-[250px]">
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <button 
            disabled={pagination.page <= 1} 
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            className="px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-lg disabled:opacity-50 transition-colors hover:bg-muted/80"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pageCount}
          </span>
          <button 
            disabled={pagination.page >= pagination.pageCount} 
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            className="px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-lg disabled:opacity-50 transition-colors hover:bg-muted/80"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
