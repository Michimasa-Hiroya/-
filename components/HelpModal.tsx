import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">？</span>
            アプリの使い方
          </h2>
          
          <div className="space-y-4 text-gray-600">
            <section>
              <h3 className="font-bold text-gray-800 mb-1">1. 予定の確認・追加</h3>
              <p className="text-sm">カレンダーの日付をタップすると、その日の予定一覧が表示されます。「＋」ボタンから新しい予定を追加できます。</p>
            </section>
            
            <section>
              <h3 className="font-bold text-gray-800 mb-1">2. 予定の編集・削除</h3>
              <p className="text-sm">登録済みの予定をタップすると、内容の編集や削除が行えます。</p>
            </section>
            
            <section>
              <h3 className="font-bold text-gray-800 mb-1">3. 繰り返し設定</h3>
              <p className="text-sm">予定作成時に「毎週」や「隔週」を選択すると、自動的に将来の予定が作成されます。</p>
            </section>
            
            <section>
              <h3 className="font-bold text-gray-800 mb-1">4. カレンダー操作</h3>
              <p className="text-sm">左右の矢印で月を移動できます。「今日」ボタンを押すと現在の日付にすぐ戻れます。</p>
            </section>
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
