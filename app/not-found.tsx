import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-primary-green mb-4">404</h1>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        ページが見つかりません
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary-green text-white rounded-lg font-bold hover:bg-primary-green/90 transition-colors"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
