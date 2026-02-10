'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">
          エラーが発生しました
        </h2>
        <p className="text-gray-400 mb-6">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-green text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors"
        >
          再試行
        </button>
      </div>
    </div>
  );
}
