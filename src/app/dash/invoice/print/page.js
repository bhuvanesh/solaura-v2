"use client"
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ExcelModifier from '@/components/invoice';

const Invoiceprint = () => {
  const searchParams = useSearchParams();
  const dataString = searchParams.get('data');
  const [downloadClicked, setDownloadClicked] = useState(false);
  const [saveClicked, setSaveClicked] = useState(false);


 

  // Parse the data string into an object
  let data;
  try {
    data = JSON.parse(dataString);
  } catch (error) {
    console.error('Failed to parse data:', error);
  }

  const saveData = () => {
    if (data.regdevice != null) { 
      fetch('print/invoiceupd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceIds: data.regdevice }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setSaveClicked(true);
        window.alert("Invoice Created Successfully");
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  };
  
  const keyMapping = {
    capacity: 'Capacity (MW)',
    regNo: 'No of Registration',
    issued:'Issued (MWh)',
    ISP:'Indicative Unit Sale Price (USD)',
    issuanceFee:'Issuance Fee (Euros)',
    registrationFee:'Registration Fee',
    USDExchange:'USD to INR Exchange rate',
    EURExchange:'EUR to INR Exchange rate',
    gross:'Gross Revenue (INR)',
    regFeeINR:'Registration Fee (INR)',
    issuanceINR:'Issuannce Fee (INR)',
    netRevenue:'Net Revenue off Registration and Issuance Fee (INR)',
    successFee:'Success Fee for Solaura(INR)',
    finalRevenue:'Net Revenue Generator(INR)',
    netRate:'Net Trade Rate (INR/MWh)',

  };
  const keysToIgnore = ['regdevice', 'groupName','invoicePeriodFrom','invoicePeriodTo','pan','gst','address','project'];


  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Invoice Preview</h1>
      <button
        className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4 ${saveClicked ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={saveData}
        disabled={saveClicked}
      >
        Save
      </button>
  
      <button 
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4 ${!saveClicked && 'opacity-50 cursor-not-allowed'}`}
        onClick={() => setDownloadClicked(true)}
        disabled={!saveClicked}
      >
        Download Invoice
      </button>
  
      {downloadClicked && <ExcelModifier data={data} />}
      <div style={{ overflowX: 'auto'}} className="border-2 rounded-lg mx-auto w-3/4 h-2/3 mt-4">
        <table className="min-w-full divide-y divide-gray-200 border rounded-md ">
          <tbody className="bg-white divide-y divide-gray-200 cursor-pointer overflow-auto">
          {data && Object.entries(data).map(([key, value], index) => {
            if (keysToIgnore.includes(key)) {
              return null;
            }
            const displayKey = keyMapping[key] || key;
  
            return (
              <tr key={index} className="hover:bg-slate-100 focus:bg-slate-200" tabIndex={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-800 bg-sky-800 text-white uppercase tracking-wider">
                  {displayKey}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-800">
                  {value}
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoiceprint;