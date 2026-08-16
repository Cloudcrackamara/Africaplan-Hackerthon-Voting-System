import type { Candidate, Voter, ElectionResults } from './election';

interface ElectionState {
  candidates: Candidate[];
  voters: Voter[];
}

const seedCandidates: Candidate[] = [
  {
    id: 'augustine',
    name: 'Augustine',
    manifesto: 'Focused on transparent budgeting and better common-room facilities.',
    votes: 0,
    nominatedAt: new Date().toISOString(),
  },
  {
    id: 'kosisochukwu',
    name: 'Kosisochukwu',
    manifesto: 'Championing weekly town-halls and a fairer chore rotation.',
    votes: 0,
    nominatedAt: new Date().toISOString(),
  },
];

const seedVoterNames = [
  'Stephanie', 'Rita', 'James', 'Peter', 'Victor', 'Anthony', 'Charles',
  'Augustine', 'Lillian', 'Gabriel', 'Christopher', 'Kosisochukwu',
  'Bonaventure', 'Abigail', 'David', 'Amarachi', 'Loveth', 'Chidimma',
  'Ifeanyi', 'Majesty',
];

const seedVoters: Voter[] = seedVoterNames.map((name) => ({
  id: name.toLowerCase(),
  name,
  hasVoted: false,
  votedFor: null,
}));

// Persist across Next.js dev hot-reloads by hanging state off globalThis.
const globalForElection = globalThis as unknown as { __electionState?: ElectionState };

function getState(): ElectionState {
  if (!globalForElection.__electionState) {
    globalForElection.__electionState = {
      candidates: seedCandidates.map((c) => ({ ...c })),
      voters: seedVoters.map((v) => ({ ...v })),
    };
  }
  return globalForElection.__electionState;
}

const slugify = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function listCandidates(): Candidate[] {
  return getState().candidates;
}

export function listVoters(): Voter[] {
  return getState().voters;
}

export function nominateCandidate(name: string, manifesto?: string): Candidate {
  const state = getState();
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Candidate name is required.');

  const id = slugify(trimmed);
  if (state.candidates.some((c) => c.id === id)) {
    throw new Error(`"${trimmed}" has already been nominated.`);
  }

  const candidate: Candidate = {
    id,
    name: trimmed,
    manifesto: manifesto?.trim() || undefined,
    votes: 0,
    nominatedAt: new Date().toISOString(),
  };
  state.candidates.push(candidate);
  return candidate;
}

export function updateCandidate(
  id: string,
  updates: { name?: string; manifesto?: string }
): Candidate {
  const state = getState();
  const candidate = state.candidates.find((c) => c.id === id);
  if (!candidate) throw new Error('Candidate not found.');

  if (updates.name !== undefined) {
    const trimmed = updates.name.trim();
    if (!trimmed) throw new Error('Candidate name cannot be empty.');
    candidate.name = trimmed;
  }
  if (updates.manifesto !== undefined) {
    candidate.manifesto = updates.manifesto.trim() || undefined;
  }
  return candidate;
}

export function castVote(voterId: string, candidateId: string): { voter: Voter; candidates: Candidate[] } {
  const state = getState();
  const voter = state.voters.find((v) => v.id === voterId);
  if (!voter) throw new Error('Voter not recognized.');
  if (voter.hasVoted) throw new Error(`${voter.name} has already voted.`);

  const candidate = state.candidates.find((c) => c.id === candidateId);
  if (!candidate) throw new Error('Candidate not found.');

  candidate.votes += 1;
  voter.hasVoted = true;
  voter.votedFor = candidate.id;

  return { voter, candidates: state.candidates };
}

export function getResults(): ElectionResults {
  const state = getState();
  const total = state.candidates.reduce((sum, c) => sum + c.votes, 0);
  const winner = state.candidates.length
    ? state.candidates.reduce((lead, c) => (c.votes > lead.votes ? c : lead), state.candidates[0])
    : null;

  return {
    candidates: state.candidates,
    total,
    totalVoters: state.voters.length,
    winner: total > 0 ? winner : null,
  };
}