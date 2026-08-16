import type { NextApiRequest, NextApiResponse } from 'next';
import { castVote } from '@/features/electionStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }

  try {
    const { voterId, candidateId } = req.body ?? {};
    if (!voterId || !candidateId) {
      return res.status(400).json({ message: 'voterId and candidateId are required.' });
    }
    const result = castVote(voterId, candidateId);
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    // Duplicate-vote attempts are a client error, not a server failure.
    return res.status(409).json({ message });
  }
}