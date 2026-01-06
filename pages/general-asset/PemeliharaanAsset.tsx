import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { Pagination } from '../../components/Pagination';
import { AssetMaintenanceModal } from '../../components/AssetMaintenanceModal';
import { assetMaintenanceService, generalAssetService, vendorService } from '../../services';
import { Eye, Edit2, Trash2, CheckCircle } from 'lucide-react';

const PemeliharaanAsset: React.FC = () => {
  const [maintenanceData, setMaintenanceData] = useState<any[]>([]);
  const [assetList, setAssetList] = useState<any[]>([]);
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('SEMUA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [maintenance, assets, vendors] = await Promise.all([
        assetMaintenanceService.getAll(),
        generalAssetService.getAll(),
        vendorService.getAll()
      ]);
      setMaintenanceData(maintenance || []);
      setAssetList(assets || []);
      setVendorList(vendors || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'view', item: any = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (modalMode === 'create') {
        const newItem = await assetMaintenanceService.create(data);
        setMaintenanceData(prev => [...prev, newItem]);
      } else {
        const updated = await assetMaintenanceService.update(selectedItem.id, data);
        setMaintenanceData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await assetMaintenanceService.delete(id);
      setMaintenanceData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Gagal menghapus data');
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? maintenanceData 
    : maintenanceData.filter(item => {
        const status = (item.status || '').toUpperCase();
        if (activeTab === 'MENUNGGU') return status === 'SCHEDULED' || status === 'PENDING';
        if (activeTab === 'IN PROGRESS') return status === 'IN PROGRESS';
        if (activeTab === 'COMPLETED') return status === 'COMPLETED';
        return true;
      });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value || 0);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Completed</span>;
    if (s === 'in progress') return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">In Progress</span>;
    if (s === 'scheduled') return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">Scheduled</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{status || 'Pending'}</span>;
  };

  const getApprovalBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Approved</span>;
    if (s === 'pending approval') return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">Pending</span>;
    if (s === 'rejected') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Rejected</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{status || 'Draft'}</span>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'MENUNGGU', 'IN PROGRESS', 'COMPLETED']}
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setCurrentPage(1); }}
        onAddClick={() => openModal('create')}
        customAddLabel="+ NEW IMPROVEMENT"
      />

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset / Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type / Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Approval Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Workflow Actions</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data pemeliharaan
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{item.assetNumber || '-'}</div>
                      <div className="text-xs text-gray-500">{item.location || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          item.category === 'Preventive' ? 'bg-blue-500' :
                          item.category === 'Corrective' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></span>
                        <div>
                          <div className="text-sm font-medium">{item.category || 'Preventive'}</div>
                          <div className="text-xs text-gray-500">{item.vendor || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{item.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.cost)}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-center">{getApprovalBadge(item.approvalStatus)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-500">
                        {item.approvalStatus === 'Approved' ? (
                          <span className="flex items-center justify-center gap-1 text-green-600">
                            <CheckCircle size={14} /> WORKFLOW COMPLETED
                          </span>
                        ) : (
                          'WORKFLOW COMPLETED'
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openModal('view', item)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="View"
                        >
                          <Eye size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => openModal('edit', item)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
          />
        )}
      </div>

      <AssetMaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        mode={modalMode}
        initialData={selectedItem}
        assetList={assetList}
        vendorList={vendorList}
      />
    </>
  );
};

export default PemeliharaanAsset;
