import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { UtilityTable } from '../../components/UtilityTable';
import { UtilityModal } from '../../components/UtilityModal';
import { utilityService } from '../../services';

const UtilityMonitoring: React.FC = () => {
  const [utilityData, setUtilityData] = useState<any[]>([]);
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
      const data = await utilityService.getAll();
      setUtilityData(data || []);
    } catch (error) {
      console.error('Failed to fetch utilities:', error);
      setUtilityData([]);
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
        const newItem = await utilityService.create(data);
        setUtilityData(prev => [...prev, newItem]);
      } else {
        const updated = await utilityService.update(selectedItem.id, data);
        setUtilityData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
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
      await utilityService.delete(id);
      setUtilityData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Gagal menghapus data');
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? utilityData 
    : utilityData.filter(item => (item.type || '').toUpperCase() === activeTab);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'LISTRIK', 'AIR', 'GAS', 'INTERNET']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="Tambah Data Utility"
      />
      <UtilityTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
      />
      {isModalOpen && (
        <UtilityModal
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

export default UtilityMonitoring;
