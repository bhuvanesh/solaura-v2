"use client"
import React, { useState, useEffect } from 'react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import ReactLoading from 'react-loading';


const ActualPending = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState('January');
  const [pendingDevices, setPendingDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const yearOptions = Array.from({ length: currentYear - 2021 }, (_, i) => 2022 + i);
  const monthOptions = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    const fetchData = async () => {
      if (year && month) {
        setLoading(true);
        try {
          const response = await fetch('/dash/actualPending/api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ year, month }),
          });
          const data = await response.json();
          setPendingDevices(data);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [year, month]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Pending Actual Credits</h1>
      <div className="flex space-x-4 mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{year || "Select Year"} <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {yearOptions.map((y) => (
              <DropdownMenuItem key={y} onSelect={() => setYear(y)}>
                {y}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{month || "Select Month"} <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {monthOptions
              .filter((_, index) => year < currentYear || index < currentMonth)
              .map((m) => (
                <DropdownMenuItem key={m} onSelect={() => setMonth(m)}>
                  {m}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <ReactLoading type="bars" color="#8000FF" />
        </div>
      ) : pendingDevices.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Total Pending Devices: {pendingDevices.length}</h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingDevices.map((device, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device['Device ID']}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device['Group']}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device['company']}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device['Actual']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p>No pending devices found.</p>
      )}
    </div>
  );
};

export default ActualPending;