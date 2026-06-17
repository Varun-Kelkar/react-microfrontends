import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { checkAllRemotes, RemoteHealthResult, RemoteStatus } from '../utils/checkRemoteHealth';

const statusConfig: Record<RemoteStatus, { label: string; className: string }> = {
  up: { label: 'Up', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  down: { label: 'Down', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  slow: { label: 'Slow', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  checking: { label: 'Checking...', className: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400' },
};

const HealthCheck: React.FC = () => {
  const [results, setResults] = useState<RemoteHealthResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runHealthCheck = useCallback(async () => {
    setLoading(true);
    const healthResults = await checkAllRemotes();
    setResults(healthResults);
    setLastChecked(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  const allUp = results.length > 0 && results.every((r) => r.status === 'up');
  const anyDown = results.some((r) => r.status === 'down');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Remote Health Check
          </h1>
          {lastChecked && (
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={runHealthCheck}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary banner */}
      {!loading && (
        <div
          className={`p-4 rounded mb-6 border ${
            allUp
              ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
              : anyDown
                ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800'
          }`}
        >
          <p className={`font-medium ${allUp ? 'text-green-800 dark:text-green-400' : anyDown ? 'text-red-800 dark:text-red-400' : 'text-yellow-800 dark:text-yellow-400'}`}>
            {allUp
              ? '✓ All remotes are healthy'
              : anyDown
                ? '✗ Some remotes are unavailable'
                : '⚠ Some remotes are responding slowly'}
          </p>
        </div>
      )}

      {/* Status table */}
      <div className="bg-white dark:bg-secondary-800 rounded shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900">
              <th className="text-left px-6 py-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                Remote Name
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                Status
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                Response Time
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                URL
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && results.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-secondary-100 dark:border-secondary-700">
                  <td className="px-6 py-4" colSpan={4}>
                    <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded animate-pulse w-3/4" />
                  </td>
                </tr>
              ))
            ) : (
              results.map((result) => {
                const config = statusConfig[result.status];
                return (
                  <tr
                    key={result.key}
                    className="border-b border-secondary-100 dark:border-secondary-700 last:border-0"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-secondary-900 dark:text-white">
                      {result.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600 dark:text-secondary-400">
                      {result.responseTime !== undefined ? `${result.responseTime}ms` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-500 dark:text-secondary-400 font-mono truncate max-w-[200px]">
                      {result.url}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HealthCheck;
