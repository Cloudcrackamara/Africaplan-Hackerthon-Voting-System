import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaEdit, FaExclamationCircle, FaSave, FaTimes, FaUserPlus } from 'react-icons/fa';
import {
  electionKeys,
  fetchCandidates,
  nominateCandidate,
  updateCandidate,
  type Candidate,
} from '@/features/election';

export default function CandidateManager() {
  const queryClient = useQueryClient();
  const candidatesQuery = useQuery({ queryKey: electionKeys.candidates, queryFn: fetchCandidates });

  const [name, setName] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: electionKeys.candidates });
    queryClient.invalidateQueries({ queryKey: electionKeys.results });
  };

  const nominateMutation = useMutation({
    mutationFn: nominateCandidate,
    onSuccess: () => {
      setName('');
      setManifesto('');
      setFormError(null);
      invalidateAll();
    },
    onError: (error: Error) => setFormError(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateCandidate,
    onSuccess: () => {
      setEditingId(null);
      invalidateAll();
    },
  });

  const handleNominate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError('Candidate name is required.');
      return;
    }
    nominateMutation.mutate({ name, manifesto });
  };

  return (
    <div className="mx-auto max-w-3xl mt-12 mb-16 px-6 lg:px-0">
      <div className="mb-10">
        <p className="eyebrow text-xs text-gold mb-2">NOMINATIONS</p>
        <h1 className="font-display text-3xl text-gray-900">Manage Candidates</h1>
        <p className="mt-2 text-sm text-gray-500">
          Nominate new candidates, and update a candidate&apos;s details any time after nomination.
        </p>
      </div>

      <form onSubmit={handleNominate} className="grid grid-cols-1 sm:grid-cols-[2fr_3fr_auto] gap-3 items-start mb-12">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Candidate name"
          className="w-full rounded-md bg-white py-3 px-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-teal"
        />
        <input
          value={manifesto}
          onChange={(e) => setManifesto(e.target.value)}
          placeholder="Manifesto (optional)"
          className="w-full rounded-md bg-white py-3 px-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-teal"
        />
        <button
          type="submit"
          disabled={nominateMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold text-white bg-teal hover:brightness-110 transition disabled:opacity-50"
        >
          <FaUserPlus /> Nominate
        </button>
        {formError && (
          <p className="sm:col-span-3 flex items-center gap-1.5 text-xs font-medium text-red-500">
            <FaExclamationCircle /> {formError}
          </p>
        )}
      </form>

      <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
        {candidatesQuery.isLoading && <p className="py-6 text-sm text-gray-400">Loading candidates…</p>}
        {candidatesQuery.data?.length === 0 && (
          <p className="py-6 text-sm text-gray-400">No candidates nominated yet.</p>
        )}
        {candidatesQuery.data?.map((candidate) => (
          <CandidateRow
            key={candidate.id}
            candidate={candidate}
            isEditing={editingId === candidate.id}
            isSaving={updateMutation.isPending && updateMutation.variables?.id === candidate.id}
            onEdit={() => setEditingId(candidate.id)}
            onCancel={() => setEditingId(null)}
            onSave={(updates) => updateMutation.mutate({ id: candidate.id, ...updates })}
          />
        ))}
      </div>
    </div>
  );
}

function CandidateRow({
  candidate,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: {
  candidate: Candidate;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updates: { name: string; manifesto: string }) => void;
}) {
  const [name, setName] = useState(candidate.name);
  const [manifesto, setManifesto] = useState(candidate.manifesto ?? '');

  if (!isEditing) {
    return (
      <div className="py-5 flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg text-gray-900">{candidate.name}</p>
          <p className="mt-1 text-sm text-gray-500">{candidate.manifesto || 'No manifesto provided.'}</p>
          <p className="mt-1 font-mono text-xs text-gray-400">{candidate.votes} votes so far</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-gray-700 outline-1 -outline-offset-1 outline-gray-300 hover:bg-gray-50"
        >
          <FaEdit /> Edit
        </button>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md bg-white py-2.5 px-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-teal"
        />
        <input
          value={manifesto}
          onChange={(e) => setManifesto(e.target.value)}
          placeholder="Manifesto"
          className="w-full rounded-md bg-white py-2.5 px-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-teal"
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => onSave({ name, manifesto })}
          className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white bg-teal hover:brightness-110 disabled:opacity-50"
        >
          <FaSave /> {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-gray-700 outline-1 -outline-offset-1 outline-gray-300 hover:bg-gray-50"
        >
          <FaTimes /> Cancel
        </button>
      </div>
    </div>
  );
}