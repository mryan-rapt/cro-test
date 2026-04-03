'use client';

import { useState } from 'react';

interface ActionButtonsProps {
  runId: string;
  previewUrl: string;
  variant: string;
}

export function ActionButtons({ runId, previewUrl, variant }: ActionButtonsProps) {
  const [state, setState] = useState<'idle' | 'accepting' | 'rejecting' | 'accepted' | 'rejected' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleAccept() {
    setState('accepting');
    try {
      const res = await fetch('/api/accept-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: runId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Accept failed');
      setState('accepted');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  }

  async function handleReject() {
    setState('rejecting');
    try {
      const res = await fetch('/api/reject-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: runId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reject failed');
      setState('rejected');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  }

  if (state === 'accepted') {
    return (
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 18px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#15803d', marginBottom: 4 }}>✓ Accepted — promoting to live</p>
        <p style={{ fontSize: 12, fontWeight: 300, color: '#166534' }}>
          <strong>{variant}</strong> is being deployed to production. The live site will update in ~60 seconds.
        </p>
      </div>
    );
  }

  if (state === 'rejected') {
    return (
      <div style={{ background: 'var(--light-grey)', border: '1px solid var(--warm-grey)', borderRadius: 10, padding: '14px 18px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>✕ Rejected</p>
        <p style={{ fontSize: 12, fontWeight: 300, color: 'var(--muted)' }}>
          Current live design retained. The CRO engine will re-analyse at the next scheduled run.
        </p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>Error</p>
        <p style={{ fontSize: 12, fontWeight: 300, color: '#7f1d1d' }}>{errorMsg}</p>
        <button onClick={() => setState('idle')} style={{ fontSize: 11, marginTop: 8, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Try again
        </button>
      </div>
    );
  }

  const busy = state === 'accepting' || state === 'rejecting';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <a
        href={previewUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block', textAlign: 'center',
          padding: '10px 16px', borderRadius: 999,
          fontSize: 13, fontWeight: 600,
          background: 'var(--purple-90)', color: 'var(--purple-0)',
          border: '1px solid var(--purple-80)', textDecoration: 'none',
        }}
      >
        View preview →
      </a>

      <button
        onClick={handleAccept}
        disabled={busy}
        style={{
          padding: '11px 16px', borderRadius: 999, border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
          fontSize: 13, fontWeight: 700, fontFamily: 'var(--font)',
          background: busy && state === 'accepting' ? 'var(--warm-grey)' : 'var(--yellow)',
          color: 'var(--black)', opacity: busy && state === 'rejecting' ? 0.4 : 1,
          transition: 'all 0.15s',
        }}
      >
        {state === 'accepting' ? 'Applying…' : '✓ Accept — push live'}
      </button>

      <button
        onClick={handleReject}
        disabled={busy}
        style={{
          padding: '11px 16px', borderRadius: 999, cursor: busy ? 'not-allowed' : 'pointer',
          fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
          background: 'var(--white)', color: 'var(--muted)',
          border: '1px solid var(--warm-grey)', opacity: busy && state === 'accepting' ? 0.4 : 1,
          transition: 'all 0.15s',
        }}
      >
        {state === 'rejecting' ? 'Rejecting…' : '✕ Reject'}
      </button>

      <p style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center', fontWeight: 300, lineHeight: 1.4 }}>
        Accept pushes the proposed design to the live URL. Reject keeps the current design unchanged.
      </p>
    </div>
  );
}
