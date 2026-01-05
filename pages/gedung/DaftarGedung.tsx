import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { BuildingTable } from '../../components/BuildingTable';
import { BuildingModal } from '../../components/BuildingModal';
import { buildingService, getMasterData } from '../../services';
import { useApprovalWorkflow, APPROVAL_MODULES } from '../../hooks/useApprovalWorkflow';

const DaftarGedung: React.FC = () => {
  const [buildingData, setBuildingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingTypeList, setBuildingTypeList] = useState<any[]>([]);
  const { getApproverName, isLastTier } = useApprovalWorkflow(APPROVAL_MODULES.BUILDING_REQUEST);
  
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
      const [buildings, types] = await Promise.all([
        buildingService.getAll(),
        getMasterData.buildingTypes(),
      ]);
      setBuildingData(buildings || []);
      setBuildingTypeList(types || []);
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
        const newBuilding = await buildingService.create(data);
        setBuildingData(prev => [...prev, newBuilding]);
      } else {
        const updated = await buildingService.update(selectedItem.id, data);
        setBuildingData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save building:', error);
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await buildingService.delete(Number(id));
      setBuildingData(prev => prev.filter(d => d.id !== Number(id)));
    } catch (error) {
      console.error('Failed to delete building:', error);
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
      updateData.status = 'Rejected';
      updateData.currentApprovalLevel = 0;
    } else if (action === 'Approve' && isLast) {
      updateData.status = 'Approved';
      updateData.currentApprovalLevel = 0;
    } else if (action === 'Approve') {
      updateData.currentApprovalLevel = currentLevel + 1;
    }

    try {
      const updated = await buildingService.update(item.id, updateData);
      setBuildingData(prev => prev.map(d => d.id === item.id ? updated : d));
    } catch (error) {
      console.error('Failed to update approval:', error);
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? buildingData 
    : buildingData.filter(item => (item.status || 'Approved').toUpperCase() === activeTab);

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
        customAddLabel="Tambah Gedung"
      />
      <BuildingTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
        onAction={handleAction}
      />
      {isModalOpen && (
        <BuildingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          mode={modalMode}
          initialData={selectedItem}
          buildingTypeList={buildingTypeList}
          existingBuildings={buildingData}
        />
      )}
    </>
  );
};

export default DaftarGedung;
