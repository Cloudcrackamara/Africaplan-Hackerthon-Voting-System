// Shared types + client-side data access for the election feature.
// Safe to import from React components — these only call `fetch` against
// our own /api routes; the actual data lives server-side in electionStore.ts.

export interface Candidate {
  id: string;
  name: string;
  manifesto?: string;
  votes: number;
  nominatedAt: string;
}

export interface Voter {
  id: string;
  name: string;
  hasVoted: boolean;
  votedFor: string | null;
}

export interface ElectionResults {
  candidates: Candidate[];
  total: number;
  totalVoters: number;
  winner: Candidate | null;
}

export const electionKeys = {
  candidates: ['candidates'] as const,
  voters: ['voters'] as const,
  results: ['results'] as const,
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.message ?? 'Something went wrong.');
  }
  return body as T;
}

export const fetchCandidates = () => request<Candidate[]>('/api/candidates');

export const fetchVoters = () => request<Voter[]>('/api/voters');

export const fetchResults = () => request<ElectionResults>('/api/results');

export const nominateCandidate = (input: { name: string; manifesto?: string }) =>
  request<Candidate>('/api/candidates', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const updateCandidate = (input: { id: string; name?: string; manifesto?: string }) =>
  request<Candidate>('/api/candidates', {
    method: 'PUT',
    body: JSON.stringify(input),
  });

export const castVote = (input: { voterId: string; candidateId: string }) =>
  request<{ voter: Voter; candidates: Candidate[] }>('/api/vote', {
    method: 'POST',
    body: JSON.stringify(input),
  });