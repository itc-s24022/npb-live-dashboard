import { RefreshButton } from '@/components/RefreshButton';
import { NotificationButton } from '@/components/NotificationButton';

export default function CalendarPage() {
  const handleRefresh = async () => {
    // キャッシュバスティング付きでAPIを呼び出し
    const response = await fetch(`/api/games?year=2025&month=6&bustCache=${Date.now()}`);
    const data = await response.json();
    // データを更新
  };

  return (
    <div>
      {/* ヘッダー */}
      <header className="flex items-center justify-between p-4">
        <h1>NPB Live</h1>
        
        <div className="flex gap-3">
          <RefreshButton onRefresh={handleRefresh} />
          <NotificationButton />
        </div>
      </header>

      {/* カレンダー本体 */}
      {/* ... */}
    </div>
  );
}

