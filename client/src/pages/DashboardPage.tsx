import  { memo, Suspense } from 'react';
import { useQuery } from '../hooks/api/useQuery';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

import DashboardStats from '../components/dashboard/DashboardStats';
import DashboardCharts from '../components/dashboard/DashboardCharts';
const DashboardPage = memo(() => {
  const { data, isLoading, error } = useQuery(
    ['dashboard-data'],
    () => 
      // Simulate API call
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            data: {
              users: 1234,
              revenue: 56789,
              orders: 890,
            },
            message: 'Success',
            status: 200,
          }),
          1000
        )
      ) as Promise<any>
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading dashboard data</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardStats data={data?.data as any} />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardCharts data={data?.data as any} />
      </Suspense>
    </div>
  );
});

DashboardPage.displayName = 'DashboardPage';
export default DashboardPage;