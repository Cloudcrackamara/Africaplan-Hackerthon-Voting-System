import Head from 'next/head';
import VotingForm from '@/component/VotingForm';
import Results from '@/component/Results';

export default function VotePage() {
  return (
    <>
      <Head>
        <title> Hackerton 3.0 — Head of House Election</title>
      </Head>

      <div className="relative isolate mx-auto max-w-5xl mt-10 mb-16 rounded-2xl border border-gray-200 shadow-xl px-6 pt-16 pb-10 lg:px-8">
        <div className="mx-auto max-w-3xl text-center border-2 shadow-amber-500 bg-amber-200 rounded-t-2xl">
          <p className="eyebrow text-xs text-gold mb-4">HEAD OF HOUSE &middot; WEEK 3</p>
          <h1 className="font-display text-5xl sm:text-6xl text-gray-900 leading-tight font-bold">
            AfricaPlan Hackerton 3.0 Head of House Election
          </h1>
          <p className="mt-6 text-white">Choose a voter and a candidate, then cast your vote.</p>
        </div>

        <VotingForm />
        <Results />
      </div>
    </>
  );
}