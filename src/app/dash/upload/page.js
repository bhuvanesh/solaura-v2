import Link from 'next/link';

const UploadButtons = () => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 space-x-4">
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
    </div>
  );
};

export default UploadButtons;