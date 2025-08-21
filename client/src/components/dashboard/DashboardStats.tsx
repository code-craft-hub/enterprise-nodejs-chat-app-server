import { memo } from 'react';

interface DashboardStatsProps {
  data: {
    users: number;
    revenue: number;
    orders: number;
  };
}

const DashboardStats = memo<DashboardStatsProps>(({ data }) => {
  const stats = [
    { label: 'Total Users', value: data.users.toLocaleString(), color: 'blue' },
    { label: 'Revenue', value: `${data.revenue.toLocaleString()}`, color: 'green' },
    { label: 'Orders', value: data.orders.toLocaleString(), color: 'purple' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full bg-${stat.color}-100`}>
              <div className={`w-6 h-6 bg-${stat.color}-500 rounded`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';
export default DashboardStats;