import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;

interface RetryLazyOptions {
  maxRetries?: number;
  baseDelay?: number;
  backoffFactor?: number;
  onError?: (error: Error, attempt: number) => void;
}

interface RetryLazyResult<T extends AnyComponent> {
  Component: React.LazyExoticComponent<T>;
  retry: () => void;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDelayWithJitter(baseDelay: number, backoffFactor: number, attempt: number): number {
  const delay = baseDelay * Math.pow(backoffFactor, attempt);
  const jitter = delay * 0.3 * Math.random();
  return delay + jitter;
}

export function retryLazy<T extends AnyComponent>(
  importFn: () => Promise<{ default: T }>,
  options: RetryLazyOptions = {}
): RetryLazyResult<T> {
  const { maxRetries = 3, baseDelay = 1000, backoffFactor = 2, onError } = options;

  let cachedPromise: Promise<{ default: T }> | null = null;

  async function attemptImport(): Promise<{ default: T }> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const module = await importFn();
        return module;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          const delay = getDelayWithJitter(baseDelay, backoffFactor, attempt);
          console.warn(
            `[MFE Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${Math.round(delay)}ms...`,
            lastError.message
          );
          onError?.(lastError, attempt + 1);
          await wait(delay);
        }
      }
    }

    // All retries exhausted — clear cache so user-initiated retry can try fresh
    cachedPromise = null;
    throw lastError;
  }

  function retryImport(): Promise<{ default: T }> {
    if (cachedPromise) return cachedPromise;
    cachedPromise = attemptImport();
    return cachedPromise;
  }

  function retry(): void {
    cachedPromise = null;
  }

  const Component = React.lazy(retryImport);

  return { Component, retry };
}
