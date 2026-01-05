
import React from 'react';
import { TaxKirRecord } from '../types';
import { ChevronsUpDown, Eye, Pencil, Trash2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Pagination, usePagination } from './Pagination';

interface Props {
  data: TaxKirRecord[];
  onEdit?: (item: TaxKirRecord) => void;
  onView?: (item: TaxKirRecord) => void;
  onDelete?: (id: string) => void;
  onAction?: (item: TaxKirRecord, action: 'Approve' | 'Reject' | 'Revise') => void;
}

export const TaxKirTable: React.FC<Props> = ({ data, onEdit, onView, onDelete, onAction }) => {
  const { t } = useLanguage();
  const pagination = usePagination(data, 10);

  const TableHeader = ({ label, className = "" }: { label: string, className?: string }) => (
    <th className={`p-4 group cursor-pointer hover:bg-gray-300/30 transition-colors border-b border-gray-200 ${className}`}>
      <div className={`flex items-center gap-2 ${className.includes('text-center') ? 'justify-center' : 'justify-between'}`}>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{label}</span>
        {!className.includes('text-center') && <ChevronsUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />}
      </div>
    </th>
  );

  const renderWorkflowActions = (item: TaxKirRecord) => {
      const s = (item.statusApproval || 'Approved').toLowerCase();
      if (s.includes('pending') && onAction) {
          return (
              <div className="flex items-center justify-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); onAction(item, 'Approve'); }} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md transition-all active:scale-95" title="Approve"><CheckCircle size={16} strokeWidth={2.5} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onAction(item, 'Revise'); }} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md transition-all active:scale-95" title="Revise"><RotateCcw size={16} strokeWidth={2.5} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onAction(item, 'Reject'); }} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition-all active:scale-95" title="Reject"><XCircle size={16} strokeWidth={2.5} /></button>
              </div>
          );
      }
      return (
          <div className="text-center">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                  WORKFLOW COMPLETED
              </span>
          </div>
      );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1300px] text-left border-collapse">
          <thead>
            <tr className="bg-[#F2F2F2]">
              <TableHeader label="No Request" />
              <TableHeader label="No Polisi" />
              <TableHeader label="Tgl Request" />
              <TableHeader label="Jenis" />
              <TableHeader label="Channel" />
              <TableHeader label="Cabang" />
              <TableHeader label="Status" className="text-center w-32" />
              <TableHeader label="Workflow Action" className="text-center w-44" />
              <th className="p-4 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase text-center w-32">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {pagination.paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-900">{item.id}</td>
                <td className="p-4 font-black text-gray-900">{item.noPolisi}</td>
                <td className="p-4 text-gray-600 font-medium">{item.tglRequest}</td>
                <td className="p-4 text-gray-600">{item.jenis}</td>
                <td className="p-4 text-gray-600">{item.channel}</td>
                <td className="p-4 text-gray-600">{item.cabang}</td>
                <td className="p-4 text-center">
                  <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-[10px] uppercase border ${
                      (item.statusApproval || '').toLowerCase().includes('pending') ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      (item.statusApproval || '').toLowerCase().includes('reject') ? 'bg-red-50 text-red-600 border-red-200' :
                      'bg-green-50 text-green-600 border-green-200'
                  }`}>
                    {item.statusApproval}
                  </div>
                </td>
                <td className="p-4 text-center">
                  {renderWorkflowActions(item)}
                </td>
                <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); onView?.(item); }} className="p-1.5 text-black hover:text-gray-600 transition-colors"><Eye size={18} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onEdit?.(item); }} className="p-1.5 text-black hover:text-gray-600 transition-colors"><Pencil size={18} /></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={pagination.onPageChange}
        onItemsPerPageChange={pagination.onItemsPerPageChange}
      />
    </div>
  );
};
