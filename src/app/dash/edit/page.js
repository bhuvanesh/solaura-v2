"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function Home() {
  const [data, setData] = useState([]);
  const router = useRouter();


  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/inv', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setData(data);
        } else {
          console.error(`Error fetching data: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
      }
    }

    fetchData();
  }, []);

  if (!data || data.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Master Data Edit</h1>
      <Link href="upload/regis">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Add new device
        </button>
      </Link>
      <div style={{ overflowX: 'auto', height: '80vh', width: '83vw' }} className="border-2 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 border rounded-md">
          <thead className="">
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium bg-sky-800 text-white uppercase tracking-wider"
                >
                  {key}
                </th>
              ))}
                  <th className="px-6 py-3 text-left text-xs font-medium bg-sky-800 text-white uppercase tracking-wider">
      Edit
    </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 cursor-pointer overflow-auto">
  {data.map((row, rowIndex) => (
    <tr key={rowIndex} className="hover:bg-slate-100 focus:bg-slate-200" tabIndex={rowIndex}>
      {Object.values(row).map((value, valueIndex) => (
        <td
          key={valueIndex}
          className="px-6 py-4 whitespace-nowrap text-sm text-sky-800"
        >
          {value}
        </td>
      ))}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-800">
        <button
onClick={() => {
            router.push(`/dash/edit/update?${new URLSearchParams(row).toString()}`);

  }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Edit
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
}