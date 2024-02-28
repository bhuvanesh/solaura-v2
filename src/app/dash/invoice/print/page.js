"use client"
import React, { useState ,useEffect, useMemo} from 'react';
import { useSearchParams } from 'next/navigation';
import ExcelModifier from '@/components/invoice';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Select from 'react-select'; // import the react-select 
import { useRouter } from 'next/navigation';
import jsPDF from "jspdf";
import "jspdf-autotable";



const Invoiceprint = () => {
  const searchParams = useSearchParams();
  const dataString = searchParams.get('data');
  const [downloadClicked, setDownloadClicked] = useState(false);
  const [saveClicked, setSaveClicked] = useState(false);
  const [data, setData] = useState({});
  const router = useRouter();



 

  // Parse the data string into an object
  useEffect(() => {
    try {
      const parsedData = JSON.parse(dataString);
      setData(parsedData);
    } catch (error) {
      console.error('Failed to parse data:', error);
    }
  }, [dataString]);

  const preprocess = (selectedDeviceIds) => {
    const selectedData = data.responseData.filter(device =>
      selectedDeviceIds.some(selectedDevice => selectedDevice.value === device["Device ID"])
    );

    // Log formData, USDExchange, and EURExchange
    console.log('formData:', data.formData);
    console.log('USDExchange:', data.USDExchange);
    console.log('EURExchange:', data.EURExchange);

    console.log(selectedData);
    return selectedData;
  };

// New function for calculations
const calculateData = (selectedDeviceIds, data) => {
  const updatedData = { ...data };
  const selectedData = preprocess(selectedDeviceIds);
  const selectedDeviceIdsString = selectedDeviceIds.map(device => device.value).join();

  // Calculate registration fee
  const noDevices = data.regdevice.split(',');
  const noDeviceCapacities = data.responseData
    .filter(device => noDevices.includes(device['Device ID']) && selectedDeviceIdsString.includes(device['Device ID']))
    .map(device => parseFloat(device.Capacity));
  const registrationFee = noDeviceCapacities.reduce((acc, capacity) => {
    if (capacity >= 3) {
      return acc + 1000;
    } else if (capacity > 1 && capacity < 3) {
      return acc + 500;
    } else if (capacity > 0.25 && capacity <= 1) {
      return acc + 100;
    } else {
      return acc + 100;
    }
  }, 0);
  updatedData.registrationFee = registrationFee;
  updatedData.regFeeINR = parseFloat((registrationFee * data.EURExchange).toFixed(4));

  // Calculate new values
  updatedData.deviceIds = selectedDeviceIdsString;
  updatedData.capacity = selectedData.reduce((acc, device) => acc + parseFloat(device.Capacity), 0).toFixed(2);
  updatedData.regNo = selectedData.length;
  updatedData.issued = parseFloat((selectedData.reduce((acc, device) => acc + parseFloat(device.TotalIssued), 0)).toFixed(4));
  updatedData.ISP = data?.formData?.unitSalePrice;
  updatedData.issuanceFee = parseFloat((0.025 * updatedData.issued).toFixed(4));  
  updatedData.gross = parseFloat((updatedData.issued * updatedData.ISP * updatedData.USDExchange).toFixed(4));
  updatedData.issuanceINR = parseFloat((updatedData.issuanceFee * updatedData.EURExchange).toFixed(4));
  updatedData.netRevenue = parseFloat((updatedData.gross - (updatedData.regFeeINR + updatedData.issuanceINR)).toFixed(4));
  updatedData.successFee = parseFloat((data?.formData?.successFee * 0.01 * updatedData.netRevenue).toFixed(4));
  updatedData.finalRevenue = parseFloat((updatedData.netRevenue - updatedData.successFee).toFixed(4));
  updatedData.netRate = parseFloat((updatedData.finalRevenue / updatedData.issued).toFixed(4));

  return updatedData;
};

// Updated saveData function
const saveData = () => {
  const selectedDeviceIdsString = selectedDeviceIds.map(device => device.value).join();
  if (selectedDeviceIdsString) {
    fetch('print/invoiceupd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceIds: selectedDeviceIdsString }),
    })
    .then(response => response.json())
    .then(responseData => {
      console.log('Success:', responseData);

      // Call the calculateData function here and ensure updatedData is defined in this scope
      const updatedData = calculateData(selectedDeviceIds, data);

      // Send the data to 'print/invoicedata'
      return fetch('print/invoicedata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      }).then((response) => {
        return response.json().then((data) => {
          return { data, updatedData }; // Pass updatedData along with the response to the next .then
        });
      });
    })
    .then(({ data, updatedData }) => { // Receive both data and updatedData here
      console.log('Success:', data);
      setData(updatedData); // Use updatedData to update the state here
      setSaveClicked(true);
      window.alert("Invoice Created Successfully");

      // Now send the data to 'print/invenupdate'
      return fetch('print/invenupdate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
};

  


const downloadWorksheetPdf = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const groupName = data.groupName || "N/A"; // Fallback to "N/A" if groupName is not defined in data

  doc.setFontSize(18);
  // Calculate text width
  const groupNameWidth = doc.getTextWidth(groupName);

  // Calculate center position (divide page width by 2 and subtract half of the text width)
  const groupNameX = (pageWidth / 2) - (groupNameWidth / 2);

  // Set groupName as the title or heading of the PDF, positioned in the center
  doc.text(groupName, groupNameX, 22);

  // Adjust startY for the first table based on the heading's position
  const startYFirstTable = 30;

  const companyHeaderRow = [["Company Name", data.formData?.companyName || "N/A"]];

  // Primary Table Rows for Key-Value pairs
  const tableRows = [];
  Object.entries(data).forEach(([key, value]) => {
      if (!keysToIgnore.includes(key) && key !== 'formData' && key !== 'groupName') { // Exclude specific keys to avoid duplication
          const displayKey = keyMapping[key] || key;
          tableRows.push([displayKey, value]);
      }
  });

  // Adding the first table to the PDF
  doc.autoTable({
      body: [...companyHeaderRow, ...tableRows],
      willDrawCell: function(data) {
          if (data.column.index === 0) {
              data.cell.styles.fontStyle = 'bold';
          }
      },
      theme: 'grid',
      startY: startYFirstTable,
      styles: { font: "helvetica", fontSize: 10 },
  });

  // Prepare a secondary table for selected device IDs and their TotalIssued values
  const selectedDevicesRows = selectedDeviceIds.map(deviceId => {
    const totalIssuedValue = data.responseData.find(device => device["Device ID"] === deviceId.value)?.TotalIssued || "N/A";
    return [deviceId.value, totalIssuedValue.toString()];
  });

  // Determine the starting Y position for the second table based on the final Y position of the first table
  const startYSecondTable = doc.lastAutoTable.finalY + 10;

  // Adding the secondary table to the PDF
  doc.autoTable({
      head: [["Device ID", "Total Issued"]],
      body: selectedDevicesRows,
      theme: 'grid',
      startY: startYSecondTable,
      styles: { font: "helvetica", fontSize: 10 },
  });

  // Save the PDF with a dynamic filename that reflects the groupName
  doc.save(`${groupName.replace(/ /g, '_')}_Invoice_data.pdf`);
};


  
  const keyMapping = {
    invoiceid: 'Invoice ID',
    capacity: 'Capacity (MW)',
    regNo: 'No of Registration',
    issued:'Issued (MWh)',
    ISP:'Indicative Unit Sale Price (USD)',
    issuanceFee:'Issuance Fee (Euros)',
    registrationFee:'Registration Fee(Euros)',
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
  const downloadAsPdf = () => {
    const queryParams = serializeData(data); // Utilize the serializeData function
    router.push(`/dash/invoice/print/pdfpreview?${queryParams}`);
  };

  function serializeData(dataObject) {
    const params = new URLSearchParams();
    Object.entries(dataObject).forEach(([key, value]) => {
        // If the value is an object, we stringify it
        if (typeof value === "object") {
            params.append(key, JSON.stringify(value));
        } else {
            params.append(key, value);
        }
    });
    return params.toString();
}

  
  const refreshStatus = () => {
    const updatedData = calculateData(selectedDeviceIds, data);
    setData(updatedData);
  };
  const keysToIgnore = ['regdevice', 'groupName','invoicePeriodFrom','invoicePeriodTo','pan','gst','address','project','date','deviceIds','responseData','formData'];
  // Holds selected device ids
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);

// creating options for the multi select
const deviceOptions = useMemo(() => {
  let options = [];
  try {
    if (data && data.responseData) {
      options = data.responseData.map(device => ({
        value: device["Device ID"],
        label: device["Device ID"]
      }));
    }
  } catch (error) {
    console.error('Failed to map device ids:', error);
  }
  return options;
}, [data.responseData]);
  // Update selectedDeviceIds once deviceOptions is populated
  useEffect(() => {
    setSelectedDeviceIds(deviceOptions);
  }, [deviceOptions]);

// function to handle selected device ids
const handleSelectChange = (selectedOptions) => {
  setSelectedDeviceIds(selectedOptions || []); 
  // When selected options change, re-calculate data
  const updatedData = calculateData(selectedOptions || [], data);
  setData(updatedData);
};
  
  const downloadAsWorksheet = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
  
    // Add columns without headers
    worksheet.columns = [
      { key: 'key', width: 10 },
      { key: 'value', width: 30 },
    ];
  
    // Add rows
    Object.entries(data).forEach(([key, value]) => {
      if (!keysToIgnore.includes(key)) {
        const displayKey = keyMapping[key] || key;
        worksheet.addRow({ key: displayKey, value });
      }
    });
  
    // Write to buffer and then convert to Blob for saving
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'Invoice data.xlsx');
    });
  };

  const isDeviceSelected = selectedDeviceIds.length > 0;
  useEffect(() => {
    setSelectedDeviceIds(deviceOptions);
    if(deviceOptions && deviceOptions.length > 0) {
        const updatedData = calculateData(deviceOptions, data);
        setData(updatedData);
    }
}, [deviceOptions]);
  

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Invoice Preview</h1>
      <button 
  className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4 ${saveClicked || !isDeviceSelected ? 'opacity-50 cursor-not-allowed' : ''}`} 
  onClick={saveData} 
  disabled={saveClicked || !isDeviceSelected} 
>
  Save 
</button>

<button 
  className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4 ${!saveClicked || !isDeviceSelected ? 'opacity-50 cursor-not-allowed' : ''}`} 
  onClick={() => setDownloadClicked(true)} 
  disabled={!saveClicked || !isDeviceSelected} 
>
  Download Invoice 
</button>

<button 
  className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4 ${!isDeviceSelected ? 'opacity-50 cursor-not-allowed' : ''}`} 
  onClick={downloadAsWorksheet} 
  disabled={!isDeviceSelected} 
>
  Download as Worksheet 
</button>

    <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded ml-4" onClick={refreshStatus}>
  Refresh Status
</button>
<button 
  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4" 
  onClick={downloadAsPdf}
>
  Download as PDF
</button>

<button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded ml-4" onClick={downloadWorksheetPdf}>
        Download Worksheet PDF
      </button>

    
<Select
  isMulti
  options={deviceOptions}
  onChange={handleSelectChange}
  value={selectedDeviceIds}
/>
  
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