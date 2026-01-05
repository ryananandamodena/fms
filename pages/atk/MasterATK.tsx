import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { MasterAtkTable } from '../../components/MasterAtkTable';
import { MasterItemModal } from '../../components/MasterItemModal';
import { masterItemService } from '../../services';

const MasterATK: React.FC = () => {
  const [itemData, setItemData] = useState<any[]>([]);
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
      const data = await masterItemService.getATK();
      setItemData(data || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItemData([]);
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
        const newItem = await masterItemService.create({
          ...data,
          category: 'ATK',
        });
        setItemData(prev => [...prev, newItem]);
      } else {
        const updated = await masterItemService.update(selectedItem.id, data);
        setItemData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
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
      await masterItemService.delete(id);
      setItemData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Gagal menghapus data');
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? itemData 
    : itemData.filter(item => (item.status || 'Active').toUpperCase() === activeTab);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'ACTIVE', 'INACTIVE']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="Tambah Item ATK"
      />
      <MasterAtkTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
      />
      {isModalOpen && (
        <MasterItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          mode={modalMode}
          initialData={selectedItem}
          category="ATK"
        />
      )}
    </>
  );
};

export default MasterATK;
