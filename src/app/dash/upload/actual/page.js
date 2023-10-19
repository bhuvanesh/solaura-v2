"use client"
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Upload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = e.target.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        let rawData = XLSX.utils.sheet_to_json(ws);

        // Convert the property names to lowercase
        let lowerCaseRawData = rawData.map(item => {
            return Object.keys(item).reduce((acc, key) => {
                acc[key.toLowerCase()] = item[key];
                return acc;
            }, {});
        });

        // Send the data to the API
        const response = await fetch('/api/actual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lowerCaseRawData),
        });
        const responseData =  await response.json();
        console.log('Response:', responseData);
        toast.success('Upload successful!', {
            autoClose: 2000,
            onClose: () => {
                window.location.reload();
            },
        });

    };

    if (file) {
        reader.readAsBinaryString(file);
    }
};

  return (
    <div className="flex flex-col items-center min-h-screen">
      <ToastContainer />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Upload Actual data File</h1>
        <input
          type="file"
          accept=".xlsx"
          className="bg-white py-2 px-4 rounded"
          onChange={handleFileChange}
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

export default Upload;