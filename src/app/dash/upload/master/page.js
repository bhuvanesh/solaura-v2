"use client"
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingButton from '@/components/Loading';

const ExcelUpload = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
  
    const readExcel = (file) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
  
      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: 'buffer' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);
  
        const renamedData = rawData.flatMap((item) => {
          const lowerCaseItem = Object.keys(item).reduce((acc, key) => {
              acc[key.toLowerCase()] = item[key];
              return acc;
          }, {});
  
          const months = [
              'january',
              'february',
              'march',
              'april',
              'may',
              'june',
              'july',
              'august',
              'september',
              'october',
              'november',
              'december',
          ];
  
          const monthValues = months.map(month => lowerCaseItem[month]);
  
          const convertSerialDate = (serial) => {
              if (isNaN(serial) || serial === null || serial === undefined) {
                  return null;
              }
              const epoch = new Date(1900, 0, 1);
              const correctSerial = serial - 2;
              const millisecondsInDay = 24 * 60 * 60 * 1000;
              const date = new Date(epoch.getTime() + correctSerial * millisecondsInDay);
              const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
              return formattedDate;
          };
  
          return months.map((month, index) => ({
              'S.No': lowerCaseItem['s.no'],
              'Device ID': lowerCaseItem['device id'],
              month,
              Estimated: monthValues[index],
              Type: lowerCaseItem['device type (wind/solar)'],
              Company: lowerCaseItem['company name'],
              Group: lowerCaseItem['group name'],
              Year: lowerCaseItem['year'],
              project: lowerCaseItem['project name'],
              'Capacity (MW)': lowerCaseItem['capacity (mw)'],
              CoD: convertSerialDate(lowerCaseItem['cod']), 
              Registered: lowerCaseItem['registered'],
          }));
      });
  
      setData(renamedData);
        
        setData(renamedData);
      };
    };
  
    const handleUpload = async () => {
      setIsLoading(true);
      // Send the renamed JSON data to the API
      const response = await fetch('/api/master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
      console.log(result);
      toast.success('Upload successful!', {
        autoClose: 2000,
        onClose: () => {
          window.location.reload();
        },
      });
      setIsLoading(false);
    };
  
    return (
      <div className="flex flex-col items-center min-h-screen">
        <ToastContainer />
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Upload Master File Here</h2>
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
            >
              Upload
            </LoadingButton>
          </div> 
        </div>
      </div>
    );
  };
  
  export default ExcelUpload;