import type { NextApiRequest, NextApiResponse } from 'next';
import { listVoters } from '@/features/electionStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
  return res.status(200).json(listVoters());
}