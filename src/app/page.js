"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
function Page() {
  const router = useRouter();

  const loadingStyle = `
    flex items-center justify-center min-h-screen
    bg-cover bg-no-repeat bg-center

  `;

  useEffect(() => {
    router.push('/dash');
  }, [router]);

  return (
    <div className={loadingStyle}>
      <div className="flex flex-col items-center">
        <img
          src="https://i.imgur.com/zyH8kh1.png"
          alt="Loading"
          className="w-[712px] h-[235px] object-cover mb-4"
        />
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
        <h1 className="text-4xl font-bold text-blue-500 animate-pulse">Loading...</h1>
      </div>
    </div>
  );
}

export default Page;