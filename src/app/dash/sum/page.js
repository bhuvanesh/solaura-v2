"use client"
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import DataTable from '@/components/DataTable';

const DownloadPage = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');


  const fetchData = async () => {
    const response = await fetch('/api/sum'); // Replace '/api/your-route' with the actual route to your route.js file
    const data = await response.json();
    setData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadAsExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'data.xlsx');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = data.filter((item) =>
    item['Company Name'].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <button onClick={downloadAsExcel} className="bg-blue-500 text-white px-4 py-2 rounded">
        Download as Excel
      </button>
      <div className="mt-8">
        <h1>Summary</h1>
        <input
          type="text"
          placeholder="Search by Company Name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="border px-4 py-2 rounded"
        />
        <DataTable data={filteredData} />
      </div>
    </div>
  );
};

export default DownloadPage;