
import React from 'react';
import { ServiceRecord } from '../types';
import { Eye, Pencil, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface Props {
  data: ServiceRecord[];
  onEdit?: (item: ServiceRecord) => void;
  onView?: (item: ServiceRecord) => void;
  onDelete?: (id: string) => void;
  onAction?: (item: ServiceRecord, action: 'Approve' | 'Reject' | 'Revise') => void;
}

export const ServiceLogTable: React.FC<Props> = ({ data, onEdit, onView, onDelete, onAction }) => {
  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'selesai':
        return 'bg-[#E8FDF5] text-[#059669]';
      case 'draf':
      case 'draft':
        return 'bg-[#F3F4F6] text-[#374151]';
      default:
        return 'bg-[#FEF3C7] text-[#D97706]';
    }
  };

  const renderWorkflowActions = (item: ServiceRecord) => {
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
            <tr className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="p-5 pl-8 w-44">NO REQUEST</th>
              <th className="p-5 w-44">NO POLISI</th>
              <th className="p-5 w-56">TGL REQUEST</th>
              <th className="p-5">CHANNEL</th>
              <th className="p-5 w-40">CABANG</th>
              <th className="p-5 w-32 text-center">STATUS</th>
              <th className="p-5 w-44 text-center">WORKFLOW ACTION</th>
              <th className="p-5 w-32 pr-8 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[12px]">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="p-5 pl-8">
                  <span className="font-bold text-black">{item.id}</span>
                </td>
                <td className="p-5">
                  <span className="font-black text-black uppercase">{item.noPolisi || '-'}</span>
                </td>
                <td className="p-5 text-gray-500 font-medium">
                  {item.tglRequest}
                </td>
                <td className="p-5 text-gray-500 font-medium uppercase">
                  {item.channel}
                </td>
                <td className="p-5 text-gray-500 font-medium">
                  {item.cabang}
                </td>
                <td className="p-5 text-center">
                  <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-black text-[9px] uppercase border ${
                      (item.statusApproval || '').toLowerCase().includes('pending') ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      (item.statusApproval || '').toLowerCase().includes('reject') ? 'bg-red-50 text-red-600 border-red-200' :
                      'bg-[#E8FDF5] text-[#059669] border-[#10B981]/20'
                  }`}>
                    {item.statusApproval || 'Pending'}
                  </div>
                </td>
                <td className="p-5 text-center">
                    {renderWorkflowActions(item)}
                </td>
                <td className="p-5 pr-8 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); onView?.(item); }} className="p-1.5 text-gray-300 hover:text-black transition-all"><Eye size={18} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onEdit?.(item); }} className="p-1.5 text-gray-300 hover:text-black transition-all"><Pencil size={18} /></button>
                    </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={9} className="p-20 text-center">
                  <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest italic">Data tidak ditemukan</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Pagination */}
      <div className="px-8 py-5 bg-white border-t border-gray-100 flex items-center justify-between">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          SHOWING 1 - {data.length} OF <span className="text-black">{data.length}</span> ROW(S)
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-black transition-all">
              <ChevronsLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-black transition-all">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-black transition-all">
              <ChevronRight size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-black transition-all">
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
