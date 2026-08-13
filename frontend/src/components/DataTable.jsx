import React from 'react';
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';

export const DataTable = ({ columns, data, onEdit, onDelete }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-primary/50 transition-shadow">
          <Search className="w-4 h-4 text-foreground/50 mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-foreground/40 text-foreground"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10 text-foreground/60 text-sm">
              {columns.map((col) => (
                <th key={col.key} className="pb-3 px-4 font-medium">{col.label}</th>
              ))}
              {(onEdit || onDelete) && <th className="pb-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:bg-white/5 transition-colors group">
                {columns.map((col) => (
                  <td key={col.key} className="py-4 px-4 text-sm">
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="py-4 px-4 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button onClick={() => onEdit(item)} className="text-foreground/50 hover:text-primary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(item)} className="text-foreground/50 hover:text-danger transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="py-8 text-center text-foreground/50 text-sm">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between mt-4 text-sm text-foreground/60">
        <p>Showing {data.length} entries</p>
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-md hover:bg-black/10 dark:bg-white/10 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
          <button className="p-1 rounded-md hover:bg-black/10 dark:bg-white/10 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};
