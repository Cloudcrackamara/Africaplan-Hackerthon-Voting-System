import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { GiPartyPopper } from 'react-icons/gi';
import { electionKeys, fetchResults } from '@/features/election';

const barColors = ['bg-gold', 'bg-teal', 'bg-red-400', 'bg-indigo-400', 'bg-emerald-500'];
const textColors = ['text-gold', 'text-teal', 'text-red-400', 'text-indigo-400', 'text-emerald-500'];

const confettiPalette = ['#C98A2C', '#1F9E8E', '#E14F4F', '#F2C14E', '#6366F1'];

export default function Results() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [celebrateKey, setCelebrateKey] = useState(0);

  const { data } = useQuery({
    queryKey: electionKeys.results,
    queryFn: fetchResults,
    refetchInterval: 5000,
  });

  const candidates = data?.candidates ?? [];
  const total = data?.total ?? 0;
  const totalVoters = data?.totalVoters ?? 0;
  const winner = data?.winner ?? null;

  const openResultDialog = () => {
    setCelebrateKey((k) => k + 1);
    dialogRef.current?.showModal();
  };

  return (
    <>
      {/* Live scoreboard */}
      <div className="mx-auto max-w-xl mt-5">
        <div className="flex justify-between items-baseline mb-1.5 font-mono text-xs">
          <span className="text-gray-500">STANDINGS</span>
          <span className="text-gray-400">
            {total} / {totalVoters} votes cast
          </span>
        </div>
        <div className="relative h-2.5 rounded-full overflow-hidden bg-gray-100 flex ring-1 ring-gray-200">
          {candidates.length === 0 && <div className="h-full w-full bg-gray-200" />}
          {candidates.map((c, i) => {
            const pct = total > 0 ? (c.votes / total) * 100 : 100 / (candidates.length || 1);
            return (
              <div
                key={c.id}
                className={`bar-transition h-full ${barColors[i % barColors.length]}`}
                style={{ width: `${pct}%` }}
                title={`${c.name}: ${c.votes}`}
              />
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
          {candidates.map((c, i) => (
            <span key={c.id} className={textColors[i % textColors.length]}>
              {c.name.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Vote result card, anchored bottom-right like the original layout */}
      <div className="mx-auto max-w-4xl mt-16 mb-6 flex justify-end">
        <div className="px-10 py-8 shadow-xl bg-teal rounded-lg text-white min-w-[220px]">
          <h2 className="font-display text-lg mb-3">Vote Result</h2>
          {candidates.length === 0 ? (
            <p className="font-mono text-sm">No candidates yet.</p>
          ) : (
            candidates.map((c) => (
              <p key={c.id} className="font-mono text-sm">
                {c.name}: {c.votes}
              </p>
            ))
          )}
        </div>
      </div>

      {/* Check result trigger */}
      <div className="mx-auto max-w-4xl mb-16">
        <button
          type="button"
          onClick={openResultDialog}
          className="rounded-md px-10 py-4 text-sm font-semibold text-white bg-gold hover:brightness-110 transition"
        >
          Check Result
        </button>
      </div>

      <ResultDialog dialogRef={dialogRef} winner={winner} total={total} celebrateKey={celebrateKey} />
    </>
  );
}

function ResultDialog({
  dialogRef,
  winner,
  total,
  celebrateKey,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  winner: { name: string; votes: number } | null;
  total: number;
  celebrateKey: number;
}) {
  useEffect(() => {
    const dialog = dialogRef.current;
    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) dialog?.close();
    };
    dialog?.addEventListener('click', handleClick);
    return () => dialog?.removeEventListener('click', handleClick);
  }, [dialogRef]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto size-auto max-h-none max-w-none overflow-visible bg-transparent backdrop:bg-gray-500/75 p-0 rounded-lg"
    >
      <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left shadow-2xl sm:my-8">
        <div className="bg-white px-4 pt-8 pb-4 sm:p-8 sm:pb-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              {winner && <Confetti key={celebrateKey} />}
              {winner ? (
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-teal shadow-lg">
                  <GiPartyPopper className="size-8 text-white" aria-hidden="true" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
                  <FaExclamationTriangle className="size-6 text-gold" aria-hidden="true" />
                </div>
              )}
            </div>

            <h3 className="font-display mt-4 text-2xl font-bold text-gray-900">
              {winner ? 'We have a leader!' : 'Current Standing'}
            </h3>
            <p className="mt-2 text-sm text-gray-500 font-mono">
              {winner
                ? `${winner.name} is leading with ${winner.votes} of ${total} votes.`
                : 'No votes cast yet.'}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-white shadow-xs hover:brightness-110 sm:ml-3 sm:w-auto"
          >
            <FaTimes /> Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 2 * Math.PI;
    const distance = 70 + (i % 3) * 20;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    return {
      id: i,
      color: confettiPalette[i % confettiPalette.length],
      tx: `${tx}px`,
      ty: `${ty}px`,
      rot: `${(i * 47) % 360}deg`,
      delay: `${(i % 5) * 30}ms`,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              backgroundColor: p.color,
              animationDelay: p.delay,
              '--tx': p.tx,
              '--ty': p.ty,
              '--rot': p.rot,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}