import { memo } from "react";
import { useAppContext } from "../../providers/AppProvider";

export const Header = memo(() => {
  const { state, dispatch } = useAppContext();

  const toggleTheme = () => {
    dispatch({
      type: "SET_THEME",
      payload: state.theme === "light" ? "dark" : "light",
    });
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Advanced React App</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
          >
            {state.theme === "light" ? "🌙" : "☀️"}
          </button>
          {state.user && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Welcome, {state.user.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";
