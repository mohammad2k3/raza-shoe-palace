import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Sparkles } from 'lucide-react';

const AnnouncementBar = () => {
  const { settings } = useStoreSettings();

  if (!settings?.announcementActive || !settings?.announcementText) {
    return null;
  }

  return (
    <div className="bg-luxury-black text-white text-xs py-2 px-4 border-b border-luxury-charcoal/50">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-center font-medium tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-luxury-gold animate-pulse shrink-0" />
        <span className="text-gray-200">{settings.announcementText}</span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
