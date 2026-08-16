import Head from 'next/head';
import CandidateManager from '@/component/CandidateManager';

export default function CandidatesPage() {
  return (
    <>
      <Head>
        <title>Manage Candidates — Africaplan Hackerton 3.0</title>
      </Head>
      <CandidateManager />
    </>
  );
}