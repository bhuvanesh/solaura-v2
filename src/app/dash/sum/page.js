"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import DataTable from "@/components/DataTable";

const DownloadPage = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    const response = await fetch("/api/sum"); // Replace '/api/your-route' with the actual route to your route.js file
    const data = await response.json();
    setData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadAsExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "data.xlsx");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = data.filter((item) =>
    item["Group"].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="py-2">
      <h1 className="text-white bg-sky-800 text-center w-full">Device Summary</h1>
      </div>
      <button
        onClick={downloadAsExcel}
        className="bg-sky-800 hover:bg-sky-700 text-white px-4 py-2 rounded"
      >
        Download as Excel
      </button>
      <div className="pt-8 pb-4">
       
        <span className="">
        <input
          type="text"
          placeholder="Search by Group"
          value={searchTerm}
          onChange={handleSearchChange}
          className="border px-4 py-2 rounded-md border-sky-800"
        />
        </span>
        {/* <span className='h-4'></span> */}
        <div className="pt-4">
        <DataTable data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
