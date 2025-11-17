import React, { useEffect, useState, useCallback } from 'react';
import { client, useConfig, useElementData } from '@sigmacomputing/plugin';
import { Button } from './components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import Settings, { DEFAULT_SETTINGS } from './Settings';
import { 
  SigmaConfig, 
  SigmaData, 
  PluginSettings, 
  ConfigParseError 
} from './types/sigma';
import { TransferRecord } from './types';
import { TransferCard } from './components/TransferCard';
import './App.css';

// Configure the plugin editor panel with all CSV columns
client.config.configureEditorPanel([
  { name: 'source', type: 'element' },
  { name: 'transferId', type: 'column', source: 'source', allowMultiple: false, label: 'Transfer Id' },
  { name: 'requestDate', type: 'column', source: 'source', allowMultiple: false, label: 'Request Date' },
  { name: 'requestedBy', type: 'column', source: 'source', allowMultiple: false, label: 'Requested By' },
  { name: 'status', type: 'column', source: 'source', allowMultiple: false, label: 'Status' },
  { name: 'productKey', type: 'column', source: 'source', allowMultiple: false, label: 'Product Key' },
  { name: 'productName', type: 'column', source: 'source', allowMultiple: false, label: 'Product Name' },
  { name: 'skuNumber', type: 'column', source: 'source', allowMultiple: false, label: 'SKU Number' },
  { name: 'excessStoreKey', type: 'column', source: 'source', allowMultiple: false, label: 'Excess Store Key' },
  { name: 'excessStoreName', type: 'column', source: 'source', allowMultiple: false, label: 'Excess Store Name' },
  { name: 'excessCity', type: 'column', source: 'source', allowMultiple: false, label: 'Excess City' },
  { name: 'excessState', type: 'column', source: 'source', allowMultiple: false, label: 'Excess State' },
  { name: 'excessDays', type: 'column', source: 'source', allowMultiple: false, label: 'Excess Days' },
  { name: 'shortageStoreKey', type: 'column', source: 'source', allowMultiple: false, label: 'Shortage Store Key' },
  { name: 'shortageStoreName', type: 'column', source: 'source', allowMultiple: false, label: 'Shortage Store Name' },
  { name: 'shortageCity', type: 'column', source: 'source', allowMultiple: false, label: 'Shortage City' },
  { name: 'shortageState', type: 'column', source: 'source', allowMultiple: false, label: 'Shortage State' },
  { name: 'shortageDays', type: 'column', source: 'source', allowMultiple: false, label: 'Shortage Days' },
  { name: 'requestedQty', type: 'column', source: 'source', allowMultiple: false, label: 'Requested QTY' },
  { name: 'excessQty', type: 'column', source: 'source', allowMultiple: false, label: 'Excess QTY' },
  { name: 'confirmedQty', type: 'column', source: 'source', allowMultiple: false, label: 'Confirmed QTY' },
  { name: 'physicalCount', type: 'column', source: 'source', allowMultiple: false, label: 'Physical Count' },
  { name: 'config', type: 'text', label: 'Settings Config (JSON)', defaultValue: "{}" },
  { name: 'editMode', type: 'toggle', label: 'Edit Mode' }
]);

// Mirror of theme presets for applying CSS variables after save
const PRESET_THEMES: Record<string, { name: string; colors: Record<string, string> }> = {
  light: {
    name: 'Light',
    colors: {
      '--background': '0 0% 100%',
      '--foreground': '240 10% 3.9%',
      '--card': '0 0% 100%',
      '--card-foreground': '240 10% 3.9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '240 10% 3.9%',
      '--primary': '240 9% 10%',
      '--primary-foreground': '0 0% 98%',
      '--secondary': '240 4.8% 95.9%',
      '--secondary-foreground': '240 5.9% 10%',
      '--muted': '240 4.8% 95.9%',
      '--muted-foreground': '240 3.8% 46.1%',
      '--accent': '240 4.8% 95.9%',
      '--accent-foreground': '240 5.9% 10%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '240 5.9% 90%',
      '--input': '240 5.9% 90%',
      '--ring': '240 5.9% 10%',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      '--background': '240 10% 3.9%',
      '--foreground': '0 0% 98%',
      '--card': '240 10% 3.9%',
      '--card-foreground': '0 0% 98%',
      '--popover': '240 10% 3.9%',
      '--popover-foreground': '0 0% 98%',
      '--primary': '0 0% 98%',
      '--primary-foreground': '240 5.9% 10%',
      '--secondary': '240 3.7% 15.9%',
      '--secondary-foreground': '0 0% 98%',
      '--muted': '240 3.7% 15.9%',
      '--muted-foreground': '240 5% 64.9%',
      '--accent': '240 3.7% 15.9%',
      '--accent-foreground': '0 0% 98%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '240 3.7% 15.9%',
      '--input': '240 3.7% 15.9%',
      '--ring': '240 4.9% 83.9%',
    },
  },
};

const applyThemeFromSettings = (settings: PluginSettings): void => {
  const theme = settings.styling?.theme || 'light';
  const colors = theme === 'custom'
    ? (settings.styling?.customColors || PRESET_THEMES.light.colors)
    : (PRESET_THEMES[theme]?.colors || PRESET_THEMES.light.colors);
  Object.entries(colors).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
};

const App: React.FC = (): React.JSX.Element => {
  const config: SigmaConfig = useConfig();
  const sigmaData: SigmaData = useElementData(config.source || '');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState<PluginSettings>(DEFAULT_SETTINGS);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);

  // Parse config JSON and load settings
  useEffect(() => {
    if (config.config?.trim()) {
      try {
        const parsedConfig = JSON.parse(config.config) as Partial<PluginSettings>;
        const newSettings: PluginSettings = { ...DEFAULT_SETTINGS, ...parsedConfig };
        setSettings(newSettings);
      } catch (err) {
        const error: ConfigParseError = {
          message: 'Invalid config JSON',
          originalError: err
        };
        console.error('Config parse error:', error);
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [config.config]);

  // Apply saved styling whenever settings change
  useEffect(() => {
    if (settings?.styling) {
      applyThemeFromSettings(settings);
    }
  }, [settings]);

  // Parse transfer data from Sigma columns
  useEffect(() => {
    if (!sigmaData || !config.transferId) {
      setTransfers([]);
      return;
    }

    try {
      const transferIdData = sigmaData[config.transferId] || [];
      const rowCount = transferIdData.length;

      const parsedTransfers: TransferRecord[] = [];

      for (let i = 0; i < rowCount; i++) {
        const getValue = (columnId: string | undefined): string | number | boolean | null => {
          if (!columnId) return '';
          return sigmaData[columnId]?.[i] ?? '';
        };

        const transfer: TransferRecord = {
          transferId: String(getValue(config.transferId)),
          requestDate: String(getValue(config.requestDate)),
          requestedBy: String(getValue(config.requestedBy)),
          status: String(getValue(config.status)),
          productKey: getValue(config.productKey) as string | number,
          productName: String(getValue(config.productName)),
          skuNumber: String(getValue(config.skuNumber)),
          excessStoreKey: getValue(config.excessStoreKey) as string | number,
          excessStoreName: String(getValue(config.excessStoreName)),
          excessCity: String(getValue(config.excessCity)),
          excessState: String(getValue(config.excessState)),
          excessDays: Number(getValue(config.excessDays)) || 0,
          shortageStoreKey: getValue(config.shortageStoreKey) as string | number,
          shortageStoreName: String(getValue(config.shortageStoreName)),
          shortageCity: String(getValue(config.shortageCity)),
          shortageState: String(getValue(config.shortageState)),
          shortageDays: Number(getValue(config.shortageDays)) || 0,
          requestedQty: Number(getValue(config.requestedQty)) || 0,
          excessQty: Number(getValue(config.excessQty)) || 0,
          confirmedQty: getValue(config.confirmedQty) ? Number(getValue(config.confirmedQty)) : null,
          physicalCount: getValue(config.physicalCount) ? Number(getValue(config.physicalCount)) : null,
        };

        parsedTransfers.push(transfer);
      }

      setTransfers(parsedTransfers);
    } catch (error) {
      console.error('Error parsing transfer data:', error);
      setTransfers([]);
    }
  }, [sigmaData, config]);

  const handleSettingsSave = useCallback((newSettings: PluginSettings): void => {
    setSettings(newSettings);
    setShowSettings(false);
  }, []);

  const handleShowSettings = useCallback((): void => {
    setShowSettings(true);
  }, []);

  const handleCloseSettings = useCallback((): void => {
    setShowSettings(false);
  }, []);

  // Early return for missing source
  if (!config.source) {
    return (
      <div className="app-container">
        <div className="empty-state">
          <h3 className="empty-state-title">Active Transfer Requests</h3>
          <p className="empty-state-text">Please select a data source to get started.</p>
        </div>
      </div>
    );
  }

  // Early return for missing required columns
  if (!config.transferId || !config.status) {
    return (
      <div className="app-container">
        <div className="empty-state">
          <h3 className="empty-state-title">Active Transfer Requests</h3>
          <p className="empty-state-text">Please configure all required columns (Transfer Id, Status, etc.)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {config.editMode && (
        <Button 
          className="settings-button"
          onClick={handleShowSettings}
          size="sm"
        >
          <SettingsIcon className="h-4 w-4" />
          Settings
        </Button>
      )}
      
      <div className="transfers-container">
        {transfers.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">No active transfers found.</p>
          </div>
        ) : (
          <div className="transfers-list">
            {transfers.map((transfer) => (
              <TransferCard key={transfer.transferId} transfer={transfer} />
            ))}
          </div>
        )}
      </div>

      <Settings
        isOpen={showSettings}
        onClose={handleCloseSettings}
        currentSettings={settings}
        onSave={handleSettingsSave}
        client={client}
      />
    </div>
  );
};

export default App;


