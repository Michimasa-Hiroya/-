import React, { useState, useEffect } from 'react';
import { BackspaceIcon } from './Icons';

const CORRECT_PIN = '6110';

interface PasswordScreenProps {
  onSuccess: () => void;
}

export const PasswordScreen: React.FC<PasswordScreenProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === CORRECT_PIN) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 800);
      }
    }
  }, [pin, onSuccess]);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const pinDots = Array(4).fill(0).map((_, i) => (
    <div
      key={i}
      className={`w-4 h-4 rounded-full transition-all duration-200 ${
        pin.length > i ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    ></div>
  ));
  
  const keypadClasses = "w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-xl text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">パスワードを入力</h1>
        <p className="text-gray-500 mb-6">4桁のパスワードを入力してください</p>
        
        <div className={`flex justify-center items-center space-x-4 mb-6 ${error ? 'animate-shake' : ''}`}>
          {pinDots}
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4 h-5">パスワードが違います</p>}
        {!error && <div className="h-5 mb-4"></div>}
        
        <div className="grid grid-cols-3 gap-4">
          {[...Array(9).keys()].map(i => (
            <button key={i + 1} onClick={() => handleNumberClick(String(i + 1))} className={keypadClasses}>
              {i + 1}
            </button>
          ))}
          <div className="w-20 h-20"></div> {/* Placeholder */}
          <button onClick={() => handleNumberClick('0')} className={keypadClasses}>
            0
          </button>
          <button onClick={handleBackspace} className={keypadClasses}>
            <BackspaceIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
