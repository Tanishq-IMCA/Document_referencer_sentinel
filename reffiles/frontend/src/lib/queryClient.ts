import { QueryClient } from '@tanstack/react-query';
import { mockNeuralSearchScan, mockFastApiGatewayScan } from './scanData';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: unknown) => {
        if (error instanceof Error && error.message.includes('401')) return false;
        return failureCount < 2;
      },
    },
  },
});

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const mockUser = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@codegnition.dev',
  occupation: 'professional' as const,
  techStack: ['Python', 'TypeScript', 'React', 'FastAPI'],
  githubUsername: 'alexchen',
  avatarUrl: undefined,
  createdAt: new Date().toISOString(),
};

export const mockRepos = [
  { id: '1', name: 'neural-search', fullName: 'alexchen/neural-search', language: 'Python', stars: 342, forks: 28, lastScanned: '2025-07-01', scanStatus: 'completed' as const, description: 'Semantic search engine using embeddings', lastScan: mockNeuralSearchScan },
  { id: '2', name: 'fastapi-gateway', fullName: 'alexchen/fastapi-gateway', language: 'Python', stars: 89, forks: 12, lastScanned: '2025-06-28', scanStatus: 'completed' as const, description: 'API gateway with auth and rate limiting', lastScan: mockFastApiGatewayScan },
  { id: '3', name: 'react-dashboard', fullName: 'alexchen/react-dashboard', language: 'TypeScript', stars: 156, forks: 34, scanStatus: 'idle' as const, description: 'Analytics dashboard with real-time updates' },
  { id: '4', name: 'cli-toolkit', fullName: 'alexchen/cli-toolkit', language: 'Go', stars: 67, forks: 8, scanStatus: 'idle' as const, description: 'Developer productivity CLI tools' },
  { id: '5', name: 'rustdb', fullName: 'alexchen/rustdb', language: 'Rust', stars: 201, forks: 19, scanStatus: 'idle' as const, description: 'Embedded key-value store in Rust' },
];
