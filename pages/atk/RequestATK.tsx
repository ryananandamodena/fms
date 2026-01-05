import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { StationeryRequestTable } from '../../components/StationeryRequestTable';
import { stationeryRequestService } from '../../services';
import { useApprovalWorkflow, APPROVAL_MODULES } from '../../hooks/useApprovalWorkflow';

const RequestATK: React.FC = () => {
  const [requestData, setRequestData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getApproverName, isLastTier } = useApprovalWorkflow(APPROVAL_MODULES.STATIONERY_REQUEST);
  
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
      const data = await stationeryRequestService.getATKRequests();
      setRequestData(data || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      setRequestData([]);
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
        const newItem = await stationeryRequestService.create({
          ...data,
          type: 'ATK',
          approvalStatus: 'Pending',
        });
        setRequestData(prev => [...prev, newItem]);
      } else {
        const updated = await stationeryRequestService.update(selectedItem.id, data);
        setRequestData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
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
      await stationeryRequestService.delete(id);
      setRequestData(prev => prev.filter(d => d.id !== id));
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
      const updated = await stationeryRequestService.update(item.id, updateData);
      setRequestData(prev => prev.map(d => d.id === item.id ? updated : d));
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? requestData 
    : requestData.filter(item => (item.approvalStatus || 'Pending').toUpperCase() === activeTab);

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
        customAddLabel="Request ATK"
      />
      <StationeryRequestTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
        onAction={handleAction}
      />
    </>
  );
};

export default RequestATK;
