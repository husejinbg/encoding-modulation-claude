import React, { useState } from 'react';
import { TabNavigation } from './components/TabNavigation';
import { DigitalToDigital } from './components/tabs/DigitalToDigital';
import { AnalogToDigital } from './components/tabs/AnalogToDigital';
import { DigitalToAnalog } from './components/tabs/DigitalToAnalog';
import { AnalogToAnalog } from './components/tabs/AnalogToAnalog';
import './App.css';

type TabId = 'digital-to-digital' | 'analog-to-digital' | 'digital-to-analog' | 'analog-to-analog';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('digital-to-digital');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Encoding and Modulation Simulation</h1>
        <p>Computer Communication Techniques Visualizer</p>
      </header>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab as (tab: string) => void} />

      <main className="app-content">
        {activeTab === 'digital-to-digital' && <DigitalToDigital />}
        {activeTab === 'analog-to-digital' && <AnalogToDigital />}
        {activeTab === 'digital-to-analog' && <DigitalToAnalog />}
        {activeTab === 'analog-to-analog' && <AnalogToAnalog />}
      </main>
    </div>
  );
};

export default App;
