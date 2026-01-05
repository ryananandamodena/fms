import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { VehicleReminderTable } from '../../components/VehicleReminderTable';
import { vehicleReminderService } from '../../services';

const ReminderPajakKir: React.FC = () => {
  const [reminderData, setReminderData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SEMUA');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await vehicleReminderService.getAll();
      setReminderData(data || []);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      setReminderData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? reminderData 
    : reminderData.filter(item => (item.status || 'Safe').toUpperCase() === activeTab);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'SAFE', 'WARNING', 'CRITICAL', 'EXPIRED']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showAddButton={false}
      />
      <VehicleReminderTable data={filteredData} />
    </>
  );
};

export default ReminderPajakKir;
