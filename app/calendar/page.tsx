import { NotificationButton } from '@/components/NotificationButton';

export default function CalendarPage() {
  return (
    <div>
      {/* ヘッダー */}
      <header className="flex items-center justify-between p-4">
        <h1 className="text-gray-900 dark:text-white">NPB Live</h1>
        
        <div className="flex gap-3">
          <NotificationButton />
        </div>
      </header>

      {/* カレンダー本体 */}
      {/* ... */}
    </div>
  );
}
