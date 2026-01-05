import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { BuildingMaintenanceTable } from '../../components/BuildingMaintenanceTable';
import { BuildingMaintenanceModal } from '../../components/BuildingMaintenanceModal';
import { buildingMaintenanceService, buildingAssetService } from '../../services';
import { useApprovalWorkflow, APPROVAL_MODULES } from '../../hooks/useApprovalWorkflow';

const BranchImprovement: React.FC = () => {
  const [maintenanceData, setMaintenanceData] = useState<any[]>([]);
  const [assetList, setAssetList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getApproverName, isLastTier } = useApprovalWorkflow(APPROVAL_MODULES.BRANCH_IMPROVEMENT);
  
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
      const [maintenance, assets] = await Promise.all([
        buildingMaintenanceService.getAll(),
        buildingAssetService.getAll(),
      ]);
      setMaintenanceData(maintenance || []);
      setAssetList(assets || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMaintenanceData([]);
      setAssetList([]);
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
        const newItem = await buildingMaintenanceService.create({
          ...data,
          approvalStatus: 'Pending',
        });
        setMaintenanceData(prev => [...prev, newItem]);
      } else {
        const updated = await buildingMaintenanceService.update(selectedItem.id, data);
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
      await buildingMaintenanceService.delete(id);
      setMaintenanceData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
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
      const updated = await buildingMaintenanceService.update(item.id, updateData);
      setMaintenanceData(prev => prev.map(d => d.id === item.id ? updated : d));
    } catch (error) {
      console.error('Failed to update approval:', error);
    }
  };

  // Filter data based on active tab
  const filteredData = activeTab === 'SEMUA' 
    ? maintenanceData 
    : maintenanceData.filter(item => {
        const status = (item.status || item.approvalStatus || '').toUpperCase();
        if (activeTab === 'IN PROGRESS') return status === 'IN PROGRESS' || status === 'INPROGRESS';
        return status.includes(activeTab.replace(' ', ''));
      });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'PENDING', 'IN PROGRESS', 'COMPLETED']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="New Improvement"
      />
      <BuildingMaintenanceTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={(id) => handleDelete(Number(id))}
        onAction={handleAction}
      />
      {isModalOpen && (
        <BuildingMaintenanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          mode={modalMode}
          initialData={selectedItem}
          assetList={assetList}
        />
      )}
    </>
  );
};

export default BranchImprovement;
