
import React from 'react';
import { MutationRecord } from '../types';
import { ChevronsUpDown, Eye, Pencil, Trash2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Pagination, usePagination } from './Pagination';

interface Props {
  data: MutationRecord[];
  onEdit?: (item: MutationRecord) => void;
  onView?: (item: MutationRecord) => void;
  onDelete?: (id: string) => void;
  onAction?: (item: MutationRecord, action: 'Approve' | 'Reject' | 'Revise') => void;
}

export const MutationTable: React.FC<Props> = ({ data, onEdit, onView, onDelete, onAction }) => {
  const pagination = usePagination(data, 10);

  const renderWorkflowActions = (item: MutationRecord) => {
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
        <table className="w-full min-w-[1400px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  No Request
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  No Polisi / No Aset
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  Cabang Aset
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  Tipe Mutasi
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  Tanggal Permintaan
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  Lokasi Asal
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  Lokasi Tujuan
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 w-32 text-center">Status</th>
              <th className="p-4 w-44 text-center">Workflow Action</th>
              <th className="p-4 w-32 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {pagination.paginatedData.map((item) => (
              <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors cursor-pointer group">
                <td className="p-4 font-medium text-gray-900">{item.id}</td>
                <td className="p-4">
                    {item.assetType === 'GENERAL_ASSET' ? (
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{item.assetNumber || '-'}</span>
                            <span className="text-[10px] text-gray-500">{item.assetName || ''}</span>
                        </div>
                    ) : (
                        <span className="font-medium text-gray-900">{item.noPolisi}</span>
                    )}
                </td>
                <td className="p-4 text-gray-600">{item.cabangAset}</td>
                <td className="p-4 text-gray-600">{item.tipeMutasi}</td>
                <td className="p-4 text-gray-600">{item.tglPermintaan}</td>
                <td className="p-4 text-gray-600">{item.lokasiAsal}</td>
                <td className="p-4 text-gray-600">{item.lokasiTujuan}</td>
                <td className="p-4 text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-[10px] uppercase ${
                        (item.statusApproval || '').toLowerCase().includes('pending') ? 'bg-orange-500 text-white' :
                        (item.statusApproval || '').toLowerCase().includes('reject') ? 'bg-red-500 text-white' :
                        'bg-green-500 text-white'
                    }`}>
                        {item.statusApproval || 'PENDING'}
                    </div>
                </td>
                <td className="p-4 text-center">
                    {renderWorkflowActions(item)}
                </td>
                <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); onView?.(item); }} className="text-black hover:text-gray-700 transition-colors"><Eye size={18} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onEdit?.(item); }} className="text-black hover:text-gray-700 transition-colors"><Pencil size={18} /></button>
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
