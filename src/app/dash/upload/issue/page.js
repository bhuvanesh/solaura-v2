"use client"
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingButton from '@/components/Loading';


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
    'january', 'february', 'march', 'april', 'may', 'june', 'july',
    'august', 'september', 'october', 'november', 'december'
  ];

  return data.flatMap((row) => {
    // Convert the property names to lowercase
    const lowerCaseRow = Object.keys(row).reduce((acc, key) => {
      acc[key.toLowerCase()] = row[key];
      return acc;
    }, {});

    const device = lowerCaseRow.device.split('-')[0].trim();

    // Convert the numeric date values to proper date objects 
    const startDate = XLSX.SSF.parse_date_code(lowerCaseRow['start date']);
    const endDate = XLSX.SSF.parse_date_code(lowerCaseRow['end date']);

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
          Year: year, 
          status: lowerCaseRow.status,
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
  const [isLoading, setIsLoading] = useState(false);


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
      setIsLoading(true);
      try {
        const processedData = processExcelData(excelData);
        const apiResponse = await sendDataToApi(processedData);
        console.log('API response:', apiResponse);
        toast.success('Data uploaded successfully', {
          onClose: () => window.location.reload()
        });      } catch (error) {
        toast.error('Error uploading data');
      } finally {
        setIsLoading(false);
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
        <div className="flex items-center space-x-4"> 
          <input
            type="file"
            className="bg-white py-2 px-4 rounded"
            onChange={(e) => {
              const file = e.target.files[0];
              readExcel(file);
            }}
          />
          <LoadingButton
            onClick={handleUpload}
            isLoading={isLoading}
            loadingLabel="Uploading..."
            className="cursor-pointer transform transition duration-500 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:scale-105 active:scale-95"
          >
            Upload
          </LoadingButton>
        </div> 
      </div>
    </div>
  );
};

export default UploadPage;