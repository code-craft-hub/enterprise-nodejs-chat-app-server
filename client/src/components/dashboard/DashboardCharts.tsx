import { memo, useMemo } from "react";

interface DashboardChartsProps {
  data: {
    users: number;
    revenue: number;
    orders: number;
  };
}

const DashboardCharts = memo<DashboardChartsProps>(({ data }) => {
  // Generate sample chart data
  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i + 1}`,
      users: Math.floor(data.users * Math.random() * 0.2),
      revenue: Math.floor(data.revenue * Math.random() * 0.1),
    }));
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Weekly Overview</h2>
      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={item.day} className="flex items-center">
            <div className="w-16 text-sm text-gray-600">{item.day}</div>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{ width: `${(item.users / data.users) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-sm text-right">
              {item.users.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

DashboardCharts.displayName = "DashboardCharts";
export default DashboardCharts;
