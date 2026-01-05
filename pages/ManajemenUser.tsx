import React, { useState, useEffect } from 'react';
import { FilterBar } from '../components/FilterBar';
import { UserTable } from '../components/UserTable';
import { UserModal } from '../components/UserModal';
import { userService } from '../services';

const ManajemenUser: React.FC = () => {
  const [userData, setUserData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('SEMUA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUserData(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUserData([]);
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
        const newUser = await userService.create(data);
        setUserData(prev => [...prev, newUser]);
      } else {
        const updated = await userService.update(selectedItem.id, data);
        setUserData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    try {
      await userService.delete(id);
      setUserData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Gagal menghapus data');
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? userData 
    : userData.filter(item => (item.status || 'Active').toUpperCase() === activeTab);

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
        customAddLabel="Tambah User"
      />
      <UserTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
      />
      {isModalOpen && (
        <UserModal
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

export default ManajemenUser;
