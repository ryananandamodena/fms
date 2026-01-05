import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, X, Check, CheckCheck, Clock, AlertCircle, 
  Car, Building, FileText, Package, Users, Wrench,
  DollarSign, Shield, Trash2, ExternalLink, Mail
} from 'lucide-react';
import { useNotifications, Notification, MODULE_LABELS } from '../hooks/useNotifications';

interface NotificationPanelProps {
  userId?: number;
  onNavigate?: (url: string) => void;
}

const getModuleIcon = (module: string) => {
  const icons: Record<string, React.ReactNode> = {
    VEHICLE: <Car size={16} />,
    BUILDING: <Building size={16} />,
    TAX_KIR: <FileText size={16} />,
    SERVICE: <Wrench size={16} />,
    MUTATION: <Package size={16} />,
    SALES: <DollarSign size={16} />,
    CONTRACT: <FileText size={16} />,
    POD: <Users size={16} />,
    LOKER: <Users size={16} />,
    ATK: <Package size={16} />,
    MAINTENANCE: <Wrench size={16} />,
    INSURANCE: <Shield size={16} />,
    BUILDING_ASSET: <Building size={16} />,
  };
  return icons[module] || <Bell size={16} />;
};

const getModuleColor = (module: string) => {
  const colors: Record<string, string> = {
    VEHICLE: 'bg-blue-500',
    BUILDING: 'bg-emerald-500',
    TAX_KIR: 'bg-orange-500',
    SERVICE: 'bg-purple-500',
    MUTATION: 'bg-cyan-500',
    SALES: 'bg-green-500',
    CONTRACT: 'bg-indigo-500',
    POD: 'bg-pink-500',
    LOKER: 'bg-rose-500',
    ATK: 'bg-amber-500',
    MAINTENANCE: 'bg-violet-500',
    INSURANCE: 'bg-teal-500',
    BUILDING_ASSET: 'bg-lime-500',
  };
  return colors[module] || 'bg-gray-500';
};

const getPriorityBadge = (priority: string) => {
  const styles: Record<string, string> = {
    Urgent: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Normal: 'bg-blue-100 text-blue-700 border-blue-200',
    Low: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return styles[priority] || styles.Normal;
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ userId, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications(userId);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => n.status === 'Unread')
    : notifications;

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 'Unread') {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-all group"
      >
        <Bell size={22} className="text-gray-600 group-hover:text-black transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} />
                <h3 className="text-[14px] font-black uppercase tracking-wider">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-[10px] font-bold rounded-full">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  filter === 'all' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  filter === 'unread' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Belum Dibaca
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="ml-auto px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 rounded-lg transition-all flex items-center gap-1"
                >
                  <CheckCheck size={12} />
                  Tandai Semua
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
                <p className="text-[11px] text-gray-400 mt-3 font-medium">Memuat notifikasi...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={24} className="text-gray-300" />
                </div>
                <p className="text-[12px] font-bold text-gray-400">Tidak ada notifikasi</p>
                <p className="text-[10px] text-gray-300 mt-1">
                  {filter === 'unread' ? 'Semua notifikasi sudah dibaca' : 'Belum ada notifikasi masuk'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-all cursor-pointer group ${
                      notification.status === 'Unread' ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Module Icon */}
                      <div className={`w-10 h-10 ${getModuleColor(notification.module)} rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg`}>
                        {getModuleIcon(notification.module)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                {MODULE_LABELS[notification.module] || notification.module}
                              </span>
                              {notification.priority !== 'Normal' && (
                                <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded border ${getPriorityBadge(notification.priority)}`}>
                                  {notification.priority}
                                </span>
                              )}
                              {notification.status === 'Unread' && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <h4 className="text-[12px] font-bold text-gray-900 line-clamp-1">
                              {notification.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Clock size={10} />
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              {notification.emailSent && (
                                <span className="text-[10px] text-green-600 flex items-center gap-1">
                                  <Mail size={10} />
                                  Email terkirim
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {notification.status === 'Unread' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1.5 hover:bg-gray-200 rounded-lg transition-all"
                                title="Tandai sudah dibaca"
                              >
                                <Check size={14} className="text-gray-500" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-all"
                              title="Hapus"
                            >
                              <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>

                        {/* Request Info */}
                        {notification.requestNo && (
                          <div className="mt-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-gray-600">
                              {notification.requestNo}
                            </span>
                            <ExternalLink size={12} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => {
                  fetchNotifications({ limit: 100 });
                }}
                className="w-full text-center text-[11px] font-bold text-gray-500 hover:text-black transition-colors"
              >
                Lihat Semua Notifikasi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
