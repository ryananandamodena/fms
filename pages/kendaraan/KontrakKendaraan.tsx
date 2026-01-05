import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { VehicleContractTable } from '../../components/VehicleContractTable';
import { VehicleContractModal } from '../../components/VehicleContractModal';
import { vehicleContractService } from '../../services';
import { useApprovalWorkflow, APPROVAL_MODULES } from '../../hooks/useApprovalWorkflow';

const KontrakKendaraan: React.FC = () => {
  const [contractData, setContractData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getApproverName, isLastTier } = useApprovalWorkflow(APPROVAL_MODULES.VEHICLE_CONTRACT);
  
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
      const data = await vehicleContractService.getAll();
      setContractData(data || []);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      setContractData([]);
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
        const newItem = await vehicleContractService.create({
          ...data,
          approvalStatus: 'Pending',
        });
        setContractData(prev => [...prev, newItem]);
      } else {
        const updated = await vehicleContractService.update(selectedItem.id, data);
        setContractData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
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
      await vehicleContractService.delete(id);
      setContractData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Gagal menghapus data');
    }
  };

  const handleAction = async (item: any, action: 'Approve' | 'Reject' | 'Revise') => {
    let updateData: any = {};
    if (action === 'Approve') {
      updateData.approvalStatus = 'Approved';
    } else if (action === 'Reject') {
      updateData.approvalStatus = 'Rejected';
    }

    try {
      const updated = await vehicleContractService.update(item.id, updateData);
      setContractData(prev => prev.map(d => d.id === item.id ? updated : d));
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? contractData 
    : contractData.filter(item => (item.approvalStatus || item.status || 'Active').toUpperCase() === activeTab);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'ACTIVE', 'EXPIRED', 'PENDING']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="Tambah Kontrak"
      />
      <VehicleContractTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
        onAction={handleAction}
      />
      {isModalOpen && (
        <VehicleContractModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          mode={modalMode}
          initialData={selectedItem}
        />
      )}
    </>
  );
};

export default KontrakKendaraan;
