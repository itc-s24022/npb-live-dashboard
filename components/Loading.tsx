export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    </div>
  );
}
