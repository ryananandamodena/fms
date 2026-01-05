
import React, { useState } from 'react';
import { ChevronDown, Menu, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { NotificationPanel } from './NotificationPanel';
import { useNavigate } from 'react-router-dom';

interface Props {
  breadcrumbs?: string[];
  onMenuClick?: () => void;
}

export const TopBar: React.FC<Props> = ({ breadcrumbs = ['Home', 'Asset Monitoring'], onMenuClick }) => {
  const { language, setLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const navigate = useNavigate();

  const toggleLanguage = (lang: 'id' | 'en') => {
    setLanguage(lang);
    setIsLangOpen(false);
  };

  // Handle notification navigation
  const handleNotificationNavigate = (url: string) => {
    // Extract path from full URL if needed
    const path = url.startsWith('http') ? new URL(url).pathname + new URL(url).search : url;
    navigate(path);
  };

  // Mock user ID - in real app, get from auth context
  const currentUserId = 1;

  return (
    <header className="h-20 bg-[#FBFBFB] flex items-center justify-between px-8 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-6">
        {/* Hamburger Menu for Mobile */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 hover:bg-white rounded-xl text-black shadow-sm"
        >
          <Menu size={24} />
        </button>

        {/* Breadcrumbs - Stylish */}
        <div className="hidden sm:flex items-center gap-3 text-sm">
           {breadcrumbs.map((item, index) => (
               <React.Fragment key={index}>
                   <span className={`font-black uppercase tracking-tight ${index === breadcrumbs.length - 1 ? 'text-black text-[14px]' : 'text-gray-300 text-[12px]'}`}>
                     {item}
                   </span>
                   {index < breadcrumbs.length - 1 && <span className="text-gray-300">/</span>}
               </React.Fragment>
           ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar (Visual Only) */}
        <div className="hidden md:flex items-center bg-white px-4 py-2.5 rounded-full border border-gray-100 shadow-sm w-64">
            <Search size={14} className="text-gray-300" />
            <input type="text" placeholder="Search anything..." className="bg-transparent border-none outline-none text-[11px] font-bold ml-2 w-full placeholder:text-gray-300" />
        </div>

        {/* Language Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-gray-300 transition-all"
          >
            {language === 'id' ? (
                <img src="https://flagcdn.com/w40/id.png" alt="Indonesia" className="w-5 h-auto rounded-sm" />
            ) : (
                <img src="https://flagcdn.com/w40/us.png" alt="English" className="w-5 h-auto rounded-sm" />
            )}
            <span className="text-[10px] font-black text-black uppercase">{language}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {isLangOpen && (
            <div className="absolute top-full right-0 mt-2 w-36 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 overflow-hidden">
                <button 
                  onClick={() => toggleLanguage('id')}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                    <img src="https://flagcdn.com/w40/id.png" alt="Indonesia" className="w-5 h-auto" />
                    <span className="text-[11px] font-bold">Indonesia</span>
                </button>
                <button 
                  onClick={() => toggleLanguage('en')}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                    <img src="https://flagcdn.com/w40/us.png" alt="English" className="w-5 h-auto" />
                    <span className="text-[11px] font-bold">English</span>
                </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <NotificationPanel 
          userId={currentUserId} 
          onNavigate={handleNotificationNavigate}
        />
        
        {/* Divider */}
        <div className="h-8 w-[1px] bg-gray-200"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-black text-black leading-tight uppercase">Ibnu Faisal</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Facility Manager</p>
          </div>
          <div className="relative">
             <img 
                src="https://picsum.photos/id/1005/100/100" 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};
