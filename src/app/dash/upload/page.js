'use client'
import Link from 'next/link';

const UploadButtons = () => {
  const isResetEnabled = process.env.NEXT_PUBLIC_RESET_TOGGLE === 'on';

  
  
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


  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 space-x-2 flex">
      <Link href="/dash/upload/master">
        <button className="cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
          Master Upload
        </button>
      </Link>
      <Link href="/dash/upload/actual">
        <button className="cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
          Actual Upload
        </button>
      </Link>
      <Link href="/dash/upload/regis">
        <button className="cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
          Data Entry Form
        </button>
      </Link>
      <Link href="/dash/upload/issue">
        <button className="cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
          Issued Upload
        </button>
      </Link>
      <Link href="/dash/upload/seller">
        <button className="cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95">
          sellers data upload 
        </button>
      </Link>
      <button
        disabled={!isResetEnabled}
        className={`cursor-pointer transform transition duration-500 ease-in-out ${
          isResetEnabled ? 'bg-red-500 hover:bg-red-700' : 'bg-red-300'
        } text-white font-bold py-2 px-4 rounded ${
          isResetEnabled ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed'
        }`}
        onClick={handleMasterReset}
      >
        Master Reset
      </button>
    </div>
  );
};


export default UploadButtons;