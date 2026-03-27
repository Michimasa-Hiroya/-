import React from 'react';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3">ℹ️</span>
            製作者情報
          </h2>
          
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">製作者</h3>
              <p className="text-lg font-bold text-gray-900">廣谷 迪正</p>
              <p className="text-sm text-gray-500">（ひろや みちまさ）</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">釧路生成AIラボ</h3>
                <a 
                  href="https://kushiro-ai-lab.netlify.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm font-medium block mb-1"
                >
                  kushiro-ai-lab.netlify.app/
                </a>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">お問い合わせ</h3>
                <a 
                  href="mailto:kushiro.ai.lab@gmail.com" 
                  className="text-blue-600 hover:underline text-sm font-medium block"
                >
                  kushiro.ai.lab@gmail.com
                </a>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">公式 X (旧Twitter)</h3>
                <a 
                  href="https://x.com/kushiro_ai_lab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm font-medium block"
                >
                  @kushiro_ai_lab
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-10 w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
