"use client"
import React, { useState ,useEffect, useMemo,useRef} from 'react';
import { useSearchParams } from 'next/navigation';
import ExcelModifier from '@/components/invoice';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Select from 'react-select'; 
import { useRouter } from 'next/navigation';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import jsPDF from "jspdf";
import "jspdf-autotable";
import useStore from '@/app/zust/store';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
const Invoiceprint = () => {
  const [downloadClicked, setDownloadClicked] = useState(false);
  const [saveClicked, setSaveClicked] = useState(false);
  const [data, setData] = useState({});
  const router = useRouter();
  const [openPopup, setOpenPopup] = useState(false);
const [selectedDevice, setSelectedDevice] = useState(null);
const [initialIssuedValues, setInitialIssuedValues] = useState({});
const [errorMessages, setErrorMessages] = useState({});
const [initialSelectionDone, setInitialSelectionDone] = useState(false);
const parsedDataRef = useRef({});


const handleDeviceClick = (device) => {
  setSelectedDevice(device);
  setOpenPopup(true);


};
  // Use Zustand store to get processedDataParam
  const processedDataParam = useStore(state => state.processedDataParam);

  useEffect(() => {
    if (processedDataParam) {
      try {
        parsedDataRef.current = JSON.parse(decodeURIComponent(processedDataParam));
        setData(parsedDataRef.current); 
      } catch (error) {
        console.error('Failed to parse data:', error);
      }
    } else {
      console.error('No data available from store');
    }
  }, [processedDataParam]);
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
  updatedData.issued = parseFloat(selectedData.reduce((acc, device) => acc + parseFloat(device.TotalIssued), 0).toFixed(4));
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

  
const updateIssuedValue = (month, newValue) => {
  // Convert newValue to a number or default to 0 if blank
  let newEnteredValue = newValue === '' ? 0 : parseFloat(newValue);

  // Access the initial value for the month from parsedDataRef
  const initialMonthValue = parsedDataRef.current.responseData?.find(device => device['Device ID'] === selectedDevice['Device ID'])[`${month}Issued`] || 0;

  if (newEnteredValue > parseFloat(initialMonthValue)) {
    // Handle validation error -- e.g., updating errorMessages state
    setErrorMessages(prevErrors => ({
      ...prevErrors,
      [month]: 'Value exceeds the actual value',
    }));
  } else {
    // Update the device's value for the month and clear any error
    setSelectedDevice(prevDevice => ({
      ...prevDevice,
      [`${month}Issued`]: newValue,
    }));
    setErrorMessages(prevErrors => ({
      ...prevErrors,
      [month]: '',
    }));
  }
};


const downloadWorksheetPdf = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Retrieve groupName and format it with invoicePeriodFrom and invoicePeriodTo
  const groupName = data.groupName || "N/A";
  const invoicePeriod = data.invoicePeriodFrom && data.invoicePeriodTo ? `(${data.invoicePeriodFrom} to ${data.invoicePeriodTo})` : "";
  const fullName = `${groupName} ${invoicePeriod}`; // Combine the groupName with the invoice period

  doc.setFontSize(18);
  const fullNameWidth = doc.getTextWidth(fullName);
  const fullNameX = (pageWidth / 2) - (fullNameWidth / 2);
  doc.text(fullName, fullNameX, 22);

  const startYFirstTable = 30;

  const companyHeaderRow = [["Company Name", data.formData?.companyName || "N/A"]];

  const tableRows = [];
  Object.entries(data).forEach(([key, value]) => {
    if (!keysToIgnore.includes(key) && key !== 'formData' && key !== 'groupName') {
      const displayKey = keyMapping[key] || key;
      tableRows.push([displayKey, value]);
    }
  });

  doc.autoTable({
    body: [...companyHeaderRow, ...tableRows],
    willDrawCell: function (data) {
      if (data.column.index === 0) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
    theme: 'grid',
    startY: startYFirstTable,
    styles: { font: "helvetica", fontSize: 10 },
  });

  const startYSecondTable = doc.lastAutoTable.finalY + 10;

  // Updated months array to include October, November, and December
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const selectedDevicesRows = selectedDeviceIds.map(deviceId => {
    const device = data.responseData.find(device => device["Device ID"] === deviceId.value);
    if (device) {
      // Maps each month to its corresponding 'Issued' value or "0" if not available
      const monthValues = months.map(month => device[`${month}Issued`] || "0");
      return [deviceId.value, ...monthValues, device.TotalIssued.toString()];
    } else {
      return [deviceId.value, ...Array(months.length).fill("N/A"), "N/A"];
    }
  });

  doc.autoTable({
    head: [["Device ID", ...months, "Total Issued"]],
    body: selectedDevicesRows,
    theme: 'grid',
    startY: startYSecondTable,
    styles: { font: "helvetica", fontSize: 5 }, // Set a smaller font size here
  });

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
    // Only set the initial selection, but don't override user selection afterward.
    if (!initialSelectionDone && deviceOptions.length > 0) {
      setSelectedDeviceIds(deviceOptions);
      setInitialSelectionDone(true); // Prevent further automatic selection.
    }
  }, [deviceOptions, initialSelectionDone]);
  
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4 mx-auto">Invoice Generation</h1>
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

{/* <button 
  className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4 ${!isDeviceSelected ? 'opacity-50 cursor-not-allowed' : ''}`} 
  onClick={downloadAsWorksheet} 
  disabled={!isDeviceSelected} 
>
  Download as Worksheet 
</button>

    <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded ml-4" onClick={refreshStatus}>
  Refresh Status
</button> */}
<button 
  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4" 
  onClick={downloadAsPdf}
>
  Invoice Preview
</button>

<button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded ml-4" onClick={downloadWorksheetPdf}>
        Download Worksheet PDF
      </button>

    
      <Select
  isMulti
  options={deviceOptions}
  onChange={handleSelectChange}
  value={selectedDeviceIds}
  formatOptionLabel={(option) => (
    <div className="flex items-center">
      <span>{option.label}</span>
      {!selectedDeviceIds.find(selectedOption => selectedOption.value === option.value) && (
        <PencilSquareIcon
          className="h-5 w-5 text-blue-500 hover:text-blue-700 cursor-pointer ml-2"
          onClick={(event) => {
            event.stopPropagation();
            const device = data.responseData.find((device) => device['Device ID'] === option.value);
            handleDeviceClick(device);
          }}
        />
      )}
    </div>
  )}
  
  onMenuOpen={() => {
    const selectOptions = document.querySelectorAll('.react-select__option');
    selectOptions.forEach((option) => {
      const editIcon = option.querySelector('.w-5');
      if (editIcon) {
        editIcon.addEventListener('click', (event) => {
          event.stopPropagation();
          const deviceId = option.dataset.value;
          const device = data.responseData.find((device) => device['Device ID'] === deviceId);
          handleDeviceClick(device);
        });
      }
    });
  }}
/>
  
      {downloadClicked && <ExcelModifier data={data} />}
      <div className="border-2 rounded-lg mx-auto w-4/5 h-2/3 mt-4">
  <div className="text-xl font-bold mb-4 text-center">Worksheet Data</div>
  <div style={{ overflowX: 'auto', maxHeight: 'calc(100% - 48px)' }}>
    <table className="min-w-full divide-y divide-gray-200 border rounded-md">
      <thead className="bg-white sticky top-0">
        <tr>
          <th className="px-6 py-4 whitespace-nowrap text-xs font-bold uppercase tracking-wider bg-sky-800 text-white w-1/3">Item</th>
          <th className="px-6 py-4 whitespace-nowrap text-xs font-bold uppercase tracking-wider w-2/3">Value</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200 cursor-pointer overflow-auto">
      {data && Object.entries(data).map(([key, value], index) => {
        if (keysToIgnore.includes(key)) {
          return null;
        }
        const displayKey = keyMapping[key] || key;

        return (
          <tr key={index} className="hover:bg-slate-100 focus:bg-slate-200" tabIndex={index}>
            <td className="px-6 py-4 whitespace-nowrap text-xs bg-sky-800 text-white uppercase tracking-wider w-1/3">
              {displayKey}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-800 w-2/3">
              {value}
            </td>
          </tr>
        );
      })}
      </tbody>
    </table>
  </div>
</div>
      <Dialog open={openPopup} onClose={() => setOpenPopup(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Update Issued Values</DialogTitle>
  <DialogContent style={{ paddingTop: '24px' }}>
    {selectedDevice && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
{
  months
    .filter(month => selectedDevice[`${month}Issued`] !== undefined) 
    .map(month => (
      <TextField
        key={month}
        label={month}
        value={selectedDevice[`${month}Issued`] || ''} 
        onChange={(event) => {
          const newValue = event.target.value;
          updateIssuedValue(month, newValue); 
        }}
        error={Boolean(errorMessages[month])}
        helperText={errorMessages[month]}
      />
    ))
}


      </div>
    )}
  </DialogContent>
  <DialogActions>
  <Button
  onClick={() => {
    const originalDeviceData = parsedDataRef.current.responseData.find(device => device['Device ID'] === selectedDevice['Device ID']);
    if (originalDeviceData) {
      setSelectedDevice(originalDeviceData);
      setErrorMessages({});
    }
  }}
>
  Reset
</Button>

    <Button onClick={() => setOpenPopup(false)}>Cancel</Button>
<Button
onClick={() => {
    // Check if there are any error messages
    const hasErrors = Object.values(errorMessages).some((error) => error !== '');
    if (hasErrors) {
      return;
    }  setData((prevData) => {
    const updatedResponseData = prevData.responseData.map((device) => {
      if (device['Device ID'] === selectedDevice['Device ID']) {
        const updatedDevice = { ...device };
        let totalIssued = 0;
        months.forEach((month) => {
          if (selectedDevice[`${month}Issued`] !== undefined) {
            const newValue = selectedDevice[`${month}Issued`] === '' ? '0' : selectedDevice[`${month}Issued`];
            updatedDevice[`${month}Issued`] = parseFloat(newValue).toFixed(4);
            totalIssued += parseFloat(newValue);
          }
        });
        updatedDevice.TotalIssued = totalIssued.toFixed(4);
        return updatedDevice;
      }
      return device;
    });

    const updatedData = calculateData(selectedDeviceIds, {
      ...prevData,
      responseData: updatedResponseData,
    });

    return updatedData;
  });
  setOpenPopup(false);
}}
>
  Update
</Button>
  </DialogActions>
</Dialog>
    </div>
  );
};

export default Invoiceprint;





