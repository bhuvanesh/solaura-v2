'use client'
import Link from 'next/link';

const UploadButtons = () => {
  const isResetEnabled = process.env.NEXT_PUBLIC_RESET_TOGGLE === 'on';
  const currentYear = new Date().getFullYear();

  const handleMasterReset = async () => {
    if (!isResetEnabled) return;
    try {
      const response = await fetch('/api/truncate', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to reset data');
      }
      window.alert('Data reset successfully');
    } catch (error) {
      window.alert('Error: ' + error);
    }
  };

  const handlePopulateNextYearData = async () => {
    try {
      const response = await fetch('upload/populate', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to populate data');
      }
      window.alert(`Data populated successfully for ${currentYear + 1}`);
    } catch (error) {
      window.alert('Error: ' + error);
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 space-y-2 flex flex-col items-center">
      <Link href="/dash/upload/master">
        <button className="w-64 cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
          Master Upload
        </button>
      </Link>
      <Link href="/dash/upload/actual">
        <button className="w-64 cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
          Actual Upload
        </button>
      </Link>
      <Link href="/dash/upload/regis">
        <button className="w-64 cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
          Data Entry Form
        </button>
      </Link>
      <Link href="/dash/upload/issue">
        <button className="w-64 cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
          Issued Upload
        </button>
      </Link>
      <Link href="/dash/upload/seller">
        <button className="w-64 cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
          sellers data upload 
        </button>
      </Link>
      <button
        disabled={!isResetEnabled}
        className={`w-64 cursor-pointer transform transition duration-500 ease-in-out ${
          isResetEnabled ? 'bg-red-500 hover:bg-red-700' : 'bg-red-300'
        } text-white font-bold py-2 px-4 rounded ${
          isResetEnabled ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed'
        }`}
        onClick={handleMasterReset}
      >
        Master Reset
      </button>
      <button
        className="w-64 cursor-pointer transform transition duration-500 ease-in-out bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95"
        onClick={handlePopulateNextYearData}
      >
        Populate {currentYear + 1} Data
      </button>
    </div>
  );
};

export default UploadButtons;