import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { InsuranceTable } from '../../components/InsuranceTable';
import { InsuranceModal } from '../../components/InsuranceModal';
import { insuranceService } from '../../services';

const AsuransiGedung: React.FC = () => {
  const [insuranceData, setInsuranceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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
      const data = await insuranceService.getBuildingInsurances();
      setInsuranceData(data || []);
    } catch (error) {
      console.error('Failed to fetch insurances:', error);
      setInsuranceData([]);
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
        const newItem = await insuranceService.create({
          ...data,
          category: 'Building',
        });
        setInsuranceData(prev => [...prev, newItem]);
      } else {
        const updated = await insuranceService.update(selectedItem.id, data);
        setInsuranceData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
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
      await insuranceService.delete(id);
      setInsuranceData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Gagal menghapus data');
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? insuranceData 
    : insuranceData.filter(item => (item.status || 'Active').toUpperCase() === activeTab);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'ACTIVE', 'EXPIRING', 'EXPIRED']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="Tambah Asuransi"
      />
      <InsuranceTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
        category="Building"
      />
      {isModalOpen && (
        <InsuranceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          mode={modalMode}
          initialData={selectedItem}
          category="Building"
        />
      )}
    </>
  );
};

export default AsuransiGedung;
