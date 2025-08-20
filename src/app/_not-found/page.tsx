'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NotFoundPageContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div>
      <h1>Not Found</h1>
      {message && <p>{message}</p>}
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundPageContent />
    </Suspense>
  );
}