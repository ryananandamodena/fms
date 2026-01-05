import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { SalesTable } from '../../components/SalesTable';
import { SalesModal } from '../../components/SalesModal';
import { vehicleSaleService } from '../../services';
import { useApprovalWorkflow, APPROVAL_MODULES } from '../../hooks/useApprovalWorkflow';

const Penjualan: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getApproverName, isLastTier } = useApprovalWorkflow(APPROVAL_MODULES.VEHICLE_DISPOSAL);
  
  const [activeTab, setActiveTab] = useState('SEMUA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await vehicleSaleService.getAll();
      // Filter only vehicle sales
      const vehicleSales = (data || []).filter((s: any) => s.assetType === 'VEHICLE' || !s.assetType);
      setSalesData(vehicleSales);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      setSalesData([]);
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
        const newItem = await vehicleSaleService.create({
          ...data,
          assetType: 'VEHICLE',
          statusApproval: 'Pending',
        });
        setSalesData(prev => [...prev, newItem]);
      } else {
        const updated = await vehicleSaleService.update(selectedItem.id, data);
        setSalesData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
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
      await vehicleSaleService.delete(id);
      setSalesData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Gagal menghapus data');
    }
  };

  const handleAction = async (item: any, action: 'Approve' | 'Reject' | 'Revise') => {
    let updateData: any = {};
    if (action === 'Approve') {
      updateData.statusApproval = 'Approved';
    } else if (action === 'Reject') {
      updateData.statusApproval = 'Rejected';
    }

    try {
      const updated = await vehicleSaleService.update(item.id, updateData);
      setSalesData(prev => prev.map(d => d.id === item.id ? updated : d));
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? salesData 
    : salesData.filter(item => (item.status || 'Open').toUpperCase() === activeTab);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'OPEN', 'CLOSED', 'SOLD']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="Buat Lelang"
      />
      <SalesTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
        onAction={handleAction}
      />
      {isModalOpen && (
        <SalesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          mode={modalMode}
          initialData={selectedItem}
          assetType="VEHICLE"
        />
      )}
    </>
  );
};

export default Penjualan;
