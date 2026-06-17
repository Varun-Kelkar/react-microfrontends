import { REMOTES, RemoteEntry } from './remoteRegistry';

export type RemoteStatus = 'up' | 'down' | 'slow' | 'checking';

export interface RemoteHealthResult {
  name: string;
  key: string;
  url: string;
  status: RemoteStatus;
  responseTime?: number;
}

const TIMEOUT_MS = 5000;

export async function checkRemoteHealth(remote: RemoteEntry): Promise<RemoteHealthResult> {
  const entryUrl = `${remote.url}/remoteEntry.js`;
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(entryUrl, {
      method: 'HEAD',
      mode: 'cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Math.round(performance.now() - start);

    if (response.ok) {
      return { ...remote, status: responseTime > 3000 ? 'slow' : 'up', responseTime };
    }
    return { ...remote, status: 'down', responseTime };
  } catch (error) {
    const responseTime = Math.round(performance.now() - start);

    if (error instanceof DOMException && error.name === 'AbortError') {
      return { ...remote, status: 'slow', responseTime };
    }
    return { ...remote, status: 'down', responseTime };
  }
}

export async function checkAllRemotes(): Promise<RemoteHealthResult[]> {
  const results = await Promise.allSettled(REMOTES.map(checkRemoteHealth));

  return results.map((result, index) => {
    if (result.status === 'fulfilled') return result.value;
    return { ...REMOTES[index], status: 'down' as const };
  });
}
