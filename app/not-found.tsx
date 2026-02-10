import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary-green mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">
          ページが見つかりません
        </h2>
        <p className="text-gray-400 mb-6">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary-green text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
