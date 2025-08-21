import { memo } from 'react';
import { useAppContext } from '../providers/AppProvider';
import { useLocalStorage } from '../hooks/state/useLocalStorage';

const ProfilePage = memo(() => {
  const { state } = useAppContext();
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    notifications: true,
    darkMode: false,
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      
      {state.user ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {state.user.name}</p>
            <p><strong>Email:</strong> {state.user.email}</p>
            <p><strong>ID:</strong> {state.user.id}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-lg p-6">
          <p>No user data available</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={(e) =>
                setPreferences(prev => ({
                  ...prev,
                  notifications: e.target.checked,
                }))
              }
              className="mr-2"
            />
            Enable notifications
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.darkMode}
              onChange={(e) =>
                setPreferences(prev => ({
                  ...prev,
                  darkMode: e.target.checked,
                }))
              }
              className="mr-2"
            />
            Dark mode
          </label>
        </div>
      </div>
    </div>
  );
});

ProfilePage.displayName = 'ProfilePage';
export default ProfilePage;