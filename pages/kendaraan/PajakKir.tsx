import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { TaxKirTable } from '../../components/TaxKirTable';
import { TaxKirModal } from '../../components/TaxKirModal';
import { taxKirService } from '../../services';
import { useApprovalWorkflow, APPROVAL_MODULES } from '../../hooks/useApprovalWorkflow';

const PajakKir: React.FC = () => {
  const [taxKirData, setTaxKirData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getApproverName, isLastTier } = useApprovalWorkflow(APPROVAL_MODULES.TAX_KIR);
  
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
      const data = await taxKirService.getAll();
      setTaxKirData(data || []);
    } catch (error) {
      console.error('Failed to fetch tax/kir:', error);
      setTaxKirData([]);
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
        const newItem = await taxKirService.create({
          ...data,
          statusApproval: 'Pending',
        });
        setTaxKirData(prev => [...prev, newItem]);
      } else {
        const updated = await taxKirService.update(selectedItem.id, data);
        setTaxKirData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
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
      await taxKirService.delete(id);
      setTaxKirData(prev => prev.filter(d => d.id !== id));
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
      const updated = await taxKirService.update(item.id, updateData);
      setTaxKirData(prev => prev.map(d => d.id === item.id ? updated : d));
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? taxKirData 
    : taxKirData.filter(item => (item.statusApproval || 'Pending').toUpperCase() === activeTab);

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
        customAddLabel="Request Pajak/KIR"
      />
      <TaxKirTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
        onAction={handleAction}
      />
      {isModalOpen && (
        <TaxKirModal
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

export default PajakKir;
