import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaCheckCircle, FaExclamationCircle, FaVoteYea } from 'react-icons/fa';
import {
  castVote,
  electionKeys,
  fetchCandidates,
  fetchVoters,
} from '@/features/election';

export default function VotingForm() {
  const queryClient = useQueryClient();
  const [candidateId, setCandidateId] = useState('');
  const [voterId, setVoterId] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const candidatesQuery = useQuery({ queryKey: electionKeys.candidates, queryFn: fetchCandidates });
  const votersQuery = useQuery({ queryKey: electionKeys.voters, queryFn: fetchVoters });

  const selectedVoter = useMemo(
    () => votersQuery.data?.find((v) => v.id === voterId),
    [votersQuery.data, voterId]
  );

  const voteMutation = useMutation({
    mutationFn: castVote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.candidates });
      queryClient.invalidateQueries({ queryKey: electionKeys.voters });
      queryClient.invalidateQueries({ queryKey: electionKeys.results });
      setFeedback({ type: 'success', text: `Vote recorded for ${data.voter.name}. Thank you!` });
      setCandidateId('');
      setVoterId('');
    },
    onError: (error: Error) => {
      setFeedback({ type: 'error', text: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!candidateId || !voterId) {
      setFeedback({ type: 'error', text: 'Select both a candidate and a voter.' });
      return;
    }
    if (selectedVoter?.hasVoted) {
      setFeedback({ type: 'error', text: `${selectedVoter.name} has already voted.` });
      return;
    }
    voteMutation.mutate({ candidateId, voterId });
  };

  const isLoading = candidatesQuery.isLoading || votersQuery.isLoading;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl mt-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="candidate" className="block text-xs font-semibold text-gray-500 mb-1.5">
            Candidate
          </label>
          <select
            id="candidate"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-md bg-white py-3 px-3 text-base text-gray-900 font-medium outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-teal disabled:opacity-50"
          >
            <option value="" disabled>
              {isLoading ? 'Loading candidates…' : 'Select candidate'}
            </option>
            {candidatesQuery.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="voter" className="block text-xs font-semibold text-gray-500 mb-1.5">
            Voter
          </label>
          <select
            id="voter"
            value={voterId}
            onChange={(e) => setVoterId(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-md bg-white py-3 px-3 text-base text-gray-900 font-medium outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-gold disabled:opacity-50"
          >
            <option value="" disabled>
              {isLoading ? 'Loading voters…' : 'Select voter'}
            </option>
            {votersQuery.data?.map((v) => (
              <option key={v.id} value={v.id} disabled={v.hasVoted}>
                {v.name}
                {v.hasVoted ? ' (already voted)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedVoter?.hasVoted && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <FaCheckCircle className="text-teal" /> {selectedVoter.name} has already cast a vote.
        </p>
      )}

      {feedback && (
        <p
          className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${
            feedback.type === 'error' ? 'text-red-500' : 'text-teal'
          }`}
        >
          {feedback.type === 'error' ? <FaExclamationCircle /> : <FaCheckCircle />}
          {feedback.text}
        </p>
      )}

      <div className="mt-8 flex justify-start">
        <button
          type="submit"
          disabled={voteMutation.isPending || Boolean(selectedVoter?.hasVoted)}
          className="inline-flex items-center gap-2 rounded-md px-8 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaVoteYea />
          {voteMutation.isPending ? 'Casting…' : 'Cast Vote'}
        </button>
      </div>
    </form>
  );
}