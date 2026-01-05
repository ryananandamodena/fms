import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { VehicleTable } from '../../components/VehicleTable';
import { VehicleModal } from '../../components/VehicleModal';
import { vehicleService } from '../../services';
import { useApprovalWorkflow, APPROVAL_MODULES } from '../../hooks/useApprovalWorkflow';

const DaftarAset: React.FC = () => {
  const [vehicleData, setVehicleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getApproverName, isLastTier } = useApprovalWorkflow(APPROVAL_MODULES.VEHICLE_REQUEST);
  
  const [activeTab, setActiveTab] = useState('SEMUA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Fetch data from API
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getAll();
      setVehicleData(data || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setVehicleData([]);
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
        const newVehicle = await vehicleService.create({
          ...data,
          approvalStatus: 'Pending',
        });
        setVehicleData(prev => [...prev, newVehicle]);
      } else {
        const updated = await vehicleService.update(selectedItem.id, data);
        setVehicleData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await vehicleService.delete(id);
      setVehicleData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      alert('Gagal menghapus data');
    }
  };

  const handleAction = async (item: any, action: 'Approve' | 'Reject' | 'Revise') => {
    const currentLevel = item.currentApprovalLevel || 1;
    const approverName = getApproverName(currentLevel);
    const isLast = isLastTier(currentLevel);
    const today = new Date().toISOString().split('T')[0];

    const newHistory = [...(item.approvalHistory || []), {
      level: currentLevel,
      approver: approverName,
      status: action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Rejected' : 'Revised',
      date: today,
      notes: ''
    }];

    let updateData: any = { approvalHistory: newHistory };

    if (action === 'Reject') {
      updateData.approvalStatus = 'Rejected';
      updateData.currentApprovalLevel = 0;
    } else if (action === 'Approve' && isLast) {
      updateData.approvalStatus = 'Approved';
      updateData.currentApprovalLevel = 0;
    } else if (action === 'Approve') {
      updateData.currentApprovalLevel = currentLevel + 1;
    }

    try {
      const updated = await vehicleService.update(item.id, updateData);
      setVehicleData(prev => prev.map(d => d.id === item.id ? updated : d));
    } catch (error) {
      console.error('Failed to update approval:', error);
    }
  };

  // Filter data based on active tab
  const filteredData = activeTab === 'SEMUA' 
    ? vehicleData 
    : vehicleData.filter(item => (item.approvalStatus || 'Approved').toUpperCase() === activeTab);

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
        customAddLabel="Request Vehicle"
      />
      <VehicleTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
        onAction={handleAction}
      />
      {isModalOpen && (
        <VehicleModal
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

export default DaftarAset;
