import PerformanceMonitor from '@/components/performance-monitor';

export default function PerformancePage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Performance Monitor</h1>
      <PerformanceMonitor />
    </div>
  );
}
