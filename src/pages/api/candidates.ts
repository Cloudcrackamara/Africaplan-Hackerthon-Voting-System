import type { NextApiRequest, NextApiResponse } from 'next';
import { listCandidates, nominateCandidate, updateCandidate } from '@/features/electionStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        return res.status(200).json(listCandidates());
      }
      case 'POST': {
        const { name, manifesto } = req.body ?? {};
        if (!name || typeof name !== 'string') {
          return res.status(400).json({ message: 'Candidate name is required.' });
        }
        const candidate = nominateCandidate(name, manifesto);
        return res.status(201).json(candidate);
      }
      case 'PUT': {
        const { id, name, manifesto } = req.body ?? {};
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ message: 'Candidate id is required.' });
        }
        const candidate = updateCandidate(id, { name, manifesto });
        return res.status(200).json(candidate);
      }
      default: {
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ message: `Method ${req.method} not allowed.` });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    return res.status(400).json({ message });
  }
}