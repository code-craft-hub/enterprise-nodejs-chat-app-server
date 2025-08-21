import { memo, useTransition, useState } from 'react';
import { useAppContext } from '../providers/AppProvider';

const SettingsPage = memo(() => {
  const { state, dispatch } = useAppContext();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    appName: 'Advanced React App',
    maxItems: 1000,
    enableCache: true,
  });

  const handleSave = () => {
    startTransition(() => {
      // Simulate heavy computation or API call
      dispatch({ type: 'SET_LOADING', payload: true });
      
      setTimeout(() => {
        console.log('Settings saved:', formData);
        dispatch({ type: 'SET_LOADING', payload: false });
      }, 2000);
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Application Name
            </label>
            <input
              type="text"
              value={formData.appName}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, appName: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter application name"
              title="Application Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Max Items
            </label>
            <input
              type="number"
              title="Max Items"
              value={formData.maxItems}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, maxItems: parseInt(e.target.value) }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.enableCache}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, enableCache: e.target.checked }))
              }
              className="mr-2"
            />
            Enable caching
          </label>
          
          <button
            onClick={handleSave}
            disabled={isPending || state.isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isPending || state.isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
});

SettingsPage.displayName = 'SettingsPage';
export default SettingsPage;