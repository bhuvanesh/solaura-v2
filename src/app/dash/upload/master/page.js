"use client"
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExcelUpload = () => {
    const [data, setData] = useState([]);
    
  
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
          const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ];
        
          const monthValues = [
            item['Jan-23 (kWh)'],
            item['Feb -23 (kWh)'],
            item['Mar-23 (kWh)'],
            item['Apr-23(kWh)'],
            item['May-23(kWh)'],
            item['June-23(kWh)'],
            item['July-22 (kWh)'],
            item['Aug -22 (kWh)'],
            item['Sep-22 (kWh)'],
            item['Oct-22 (kWh)'],
            item['Nov-22 (kWh)'],
            item['Dec -22 (kWh)'],
          ];
          const convertSerialDate = (serial) => {
            if (isNaN(serial) || serial === null || serial === undefined) {
              return null;
            }
          
            const epoch = new Date(1900, 0, 1);
            const correctSerial = serial - 2;
            const millisecondsInDay = 24 * 60 * 60 * 1000;
          
            const date = new Date(epoch.getTime() + correctSerial * millisecondsInDay);
          
            // Convert the date to 'YYYY-MM-DD HH:mm:ss' format
            const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
          
            return formattedDate;
          };
          return months.map((month, index) => ({
            'S.No': item['S.No'],
            'Device ID': item['DEVICE ID'],
            month,
            Estimated: monthValues[index],
            Type: item['Device Type (Wind/Solar)'],
            Company: item['Company Name'],
            Group: item['Group Name'],
            project: item['Project Name'],
            'Capacity (MW)': item['Capacity (MW)'],
            CoD: convertSerialDate(item['CoD']), 
            Registered: item['Registered'],
          }));
        });
        
        setData(renamedData);
      };
    };
  
    const handleUpload = async () => {
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
    };
  
    return (
      <div className="flex flex-col items-center min-h-screen">
            <ToastContainer />
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Upload Master File Here</h2>
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
  
  export default ExcelUpload;