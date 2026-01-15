import React from 'react';
import './TabNavigation.css';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'digital-to-digital', label: 'Digital → Digital', enabled: true },
    { id: 'analog-to-digital', label: 'Analog → Digital', enabled: false },
    { id: 'digital-to-analog', label: 'Digital → Analog', enabled: false },
    { id: 'analog-to-analog', label: 'Analog → Analog', enabled: false },
  ];

  return (
    <nav className="tab-navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''} ${!tab.enabled ? 'disabled' : ''}`}
          onClick={() => tab.enabled && onTabChange(tab.id)}
          disabled={!tab.enabled}
        >
          {tab.label}
          {!tab.enabled && <span className="coming-soon"> (Coming Soon)</span>}
        </button>
      ))}
    </nav>
  );
};
