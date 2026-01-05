import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { MutationTable } from '../../components/MutationTable';
import { MutationModal } from '../../components/MutationModal';
import { vehicleMutationService } from '../../services';
import { useApprovalWorkflow, APPROVAL_MODULES } from '../../hooks/useApprovalWorkflow';

const Mutasi: React.FC = () => {
  const [mutationData, setMutationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getApproverName, isLastTier } = useApprovalWorkflow(APPROVAL_MODULES.VEHICLE_MUTATION);
  
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
      const data = await vehicleMutationService.getByType('VEHICLE');
      setMutationData(data || []);
    } catch (error) {
      console.error('Failed to fetch mutations:', error);
      setMutationData([]);
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
        const newItem = await vehicleMutationService.create({
          ...data,
          assetType: 'VEHICLE',
          statusApproval: 'Pending',
        });
        setMutationData(prev => [...prev, newItem]);
      } else {
        const updated = await vehicleMutationService.update(selectedItem.id, data);
        setMutationData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
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
      await vehicleMutationService.delete(id);
      setMutationData(prev => prev.filter(d => d.id !== id));
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
      const updated = await vehicleMutationService.update(item.id, updateData);
      setMutationData(prev => prev.map(d => d.id === item.id ? updated : d));
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? mutationData 
    : mutationData.filter(item => (item.statusApproval || 'Pending').toUpperCase() === activeTab);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'APPROVED', 'PENDING', 'REJECTED']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="Request Mutasi"
      />
      <MutationTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
        onAction={handleAction}
      />
      {isModalOpen && (
        <MutationModal
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

export default Mutasi;
