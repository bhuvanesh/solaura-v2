"use client"
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      resolve(json);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const processExcelData = (data) => {
  // Add an array of month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];

  return data.flatMap((row) => {
    const device = row.Device.split('-')[0].trim();

    // Convert the numeric date values to proper date objects 
    const startDate = XLSX.SSF.parse_date_code(row['Start Date']);
    const endDate = XLSX.SSF.parse_date_code(row['End Date']);

    const startMonth = startDate.m - 1; // Get the month index
    const endMonth = endDate.m - 1; // Get the month index

    const records = [];

    for (let year = startDate.y; year <= endDate.y; year++) {
      const start = year === startDate.y ? startMonth : 0;
      const end = year === endDate.y ? endMonth : 11;

      for (let month = start; month <= end; month++) {
        records.push({
          device,
          Month: monthNames[month],
          Year: year, // Add the year to the record
          status: row.Status,
        });
      }
    }

    return records;
  });
};

const sendDataToApi = async (data) => {
  const response = await fetch('/api/issue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

const UploadPage = () => {
  const [excelData, setExcelData] = useState(null);

  const readExcel = async (file) => {
    try {
      const jsonData = await readExcelFile(file);
      setExcelData(jsonData);
      toast.success('File read successfully');
    } catch (error) {
      toast.error('Error reading the file');
    }
  };

  const handleUpload = async () => {
    if (excelData) {
      try {
        const processedData = processExcelData(excelData);
        const apiResponse = await sendDataToApi(processedData);
        console.log('API response:', apiResponse);
        toast.success('Data uploaded successfully');
      } catch (error) {
        toast.error('Error uploading data');
      }
    } else {
      toast.error('Please select a file first');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <ToastContainer />
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Upload Issued File Here</h2>
        <input
          type="file"
          className="bg-white py-2 px-4 rounded"
          onChange={(e) => {
            const file = e.target.files[0];
            readExcel(file);
          }}
        />
        <button
          onClick={handleUpload}
          className="cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default UploadPage;