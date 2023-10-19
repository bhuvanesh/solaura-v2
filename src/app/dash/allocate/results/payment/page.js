"use client"
import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PaymentSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uniqueId = searchParams.get('uniqueId');
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dash/txn');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Transaction successful</h1>
      <p>Your transaction ID: {uniqueId}</p>
      <p>Please copy this!</p>

    </div>
  );
};

export default PaymentSuccess;