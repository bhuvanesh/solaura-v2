"use client";
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
async function fetchData() {
  const response = await fetch("/dash/txnedit/btable");
  const data = await response.json();
  return data;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Table() {
  const [data, setData] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State storing the current search term
  const [statusFilter, setStatusFilter] = useState("Active");
  const [dialogOpen, setDialogOpen] = useState(false);
const [currentMonthValue, setCurrentMonthValue] = useState("");
const [actualValue, setActualValue] = useState(null);
const [errorMessage, setErrorMessage] = useState("");
const [currentMonth, setCurrentMonth] = useState("");
const [currentYear, setCurrentYear] = useState("");
const [currentDeviceId, setCurrentDeviceId] = useState("");
const [currentTransactionId, setCurrentTransactionId] = useState("");
const [oldMonthValue, setOldMonthValue] = useState("");
const rowsPerPage = 10;
const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1);  




  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };
  const handleOpenDialog = (monthValue) => {
    setCurrentMonthValue(monthValue);
    setErrorMessage("");
    setDialogOpen(true);
  };
  const handleCloseDialog = async () => {
    if (currentMonthValue <= 0) {
      setErrorMessage("Value must be greater than 0");
      return;
    }
    if (+currentMonthValue > +actualValue) {
      setErrorMessage("Value must not be greater than the actual value");
      return;
    }
  
    // Send the old and new actual values, month, year, and device id to "/dash/txnedit/update"
    const response = await fetch("/dash/txnedit/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transactionId: currentTransactionId,
        oldactual: oldMonthValue,
        newactual: currentMonthValue,
        month: currentMonth,
        year: currentYear,
        deviceId: currentDeviceId
      }),
    });
    const data = await response.json();
    console.log(data);
  
    if (response.ok) {
      window.alert(`Update successful: ${data.message}`); 
      window.location.reload(); 
    } else {
      console.error("Failed to update the data");
      window.alert(`Update failed: ${data.message}`); 
    }
  
    // Reset the state
    setCurrentMonthValue("");
    setActualValue(null);
    setErrorMessage("");
    setDialogOpen(false);
  };

  const handleCancelDialog = () => {
    setActualValue(null);
    setCurrentMonthValue("");
    setDialogOpen(false);
  };
  const handleMonthClick = async (transactionId, deviceId, month, year, oldMonthValue) => {
    // Store the current month, year, and device id in the state
    setCurrentTransactionId(transactionId);
    setCurrentMonth(month);
    setCurrentYear(year);
    setCurrentDeviceId(deviceId);
    setOldMonthValue(oldMonthValue);
  
    // Fetch the actual value
    const response = await fetch("/dash/txnedit/actual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, month, year }),
    });
  
    const data = await response.json();
    setActualValue(data.actual);
    console.log('Actual data:', data);
  
    if (!response.ok) {
      console.error("Failed to send the data");
    }
  };
  
  const confirmDelete = (row) => {
    if (window.confirm("Do you really want to delete this?")) {
      handleDelete(row).then(() => {
        window.location.reload(); // Refresh the page after deletion
      });
    }
  };
  const handleUndo = async (row) => {
    const transactionId = row["Transaction ID"];
    const year = row["year"];
    const deviceData = row.details.map(detail => {
      const deviceId = detail["Device ID"];
      const monthData = months.reduce((acc, m) => {
        if (detail[m]) {
          acc[m] = detail[m];
        }
        return acc;
      }, {});
      return { deviceId, monthData };
    });
    const response = await fetch("/dash/txnedit/undo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactionId, year, deviceData }),
    });
  
    if (response.ok) {
      window.alert("Undo successful");
      window.location.reload();
    } else {
      console.error("Failed to undo the transaction");
      window.alert("Undo failed");
    }
  };
  
  const confirmUndo = (row) => {
    if (window.confirm("Do you really want to undo this transaction?")) {
      handleUndo(row);
    }
  };
  const handleDelete = async (row) => {
    const transactionId = row["Transaction ID"];
    const year = row["year"];
    const deviceData = row.details.map(detail => {
      const deviceId = detail["Device ID"];
      const monthData = months.reduce((acc, m) => {
        if (detail[m]) {
          acc[m] = detail[m];
        }
        return acc;
      }, {});
      return { deviceId, monthData };
    });
  
    const response = await fetch("/dash/txnedit/cancel", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactionId, year, deviceData }),
    });
  
    if (response.ok) {
      // Remove the row from the data state
      setData((prevData) => prevData.filter((item) => item["Transaction ID"] !== transactionId));
    } else {
      console.error("Failed to delete the row");
    }
  };

  useEffect(() => {
    fetchData().then((rawData) => {
      // Group data by Transaction ID
      const groupedData = rawData.reduce((acc, row) => {
        const key = row["Transaction ID"];
        if (!acc[key]) {
          acc[key] = {
            details: [],
            total: 0,
            ...row,
          };
        }
        acc[key].details.push(row);
        acc[key].total += months.reduce((sum, m) => {
          const n = parseFloat(row[m]);
          return sum + (isNaN(n) ? 0 : n);
        }, 0);
        acc[key].total = parseFloat(acc[key].total.toFixed(4));
        return acc;
      }, {});

      setData(Object.values(groupedData));

      // Calculate total pages 
      const calculatedTotalPages = Math.ceil(Object.values(groupedData).length / rowsPerPage);
      setTotalPages(calculatedTotalPages);
    });
  }, []);
   // Pagination functions
   const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const changePage = (event) => {
    const pageNumber = Number(event.target.value);
    setCurrentPage(pageNumber);
  };

  const getPaginatedData = (data) => {
    const startIndex = currentPage * rowsPerPage - rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };
  const filteredData = data.filter((item) => {
    return (
      item["Organisation"].toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === "All" || item["Status"] === "succeeded")
    );
  });

  const downloadAsPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("Transaction Data", 14, 22);
    pdf.setFontSize(11);
    pdf.setTextColor(100);

    const dataToDownload = data.filter(
      (item) => statusFilter === "All" || item["Status"] === "succeeded"
    );

    let transactionCounter = 0; // Initialize the transaction counter

    dataToDownload.forEach((row, index) => {
      // Add a new page for each transaction, but not before the first one
      if (index > 0) {
        pdf.addPage();
      }

      transactionCounter++; // Increment the transaction counter

      // Display the transaction number
      pdf.setFontSize(14);
      pdf.text(`Transaction #${transactionCounter}`, 14, 30);
      pdf.setFontSize(11);

      const transactionColumns = [
        { header: "Transaction ID", dataKey: "Transaction ID" },
        { header: "Organisation", dataKey: "Organisation" },
        { header: "Status", dataKey: "Status" },
        { header: "Total", dataKey: "total" },
      ];

      const transactionData = [
        {
          "Transaction ID": row["Transaction ID"],
          Organisation: row["Organisation"],
          Status: row["Status"],
          total: formatNumber(row["total"]),
        },
      ];

      pdf.autoTable(transactionColumns, transactionData, {
        startY: 40,
        margin: { horizontal: 14 },
        styles: { overflow: "linebreak", cellWidth: "wrap" },
        columnStyles: { text: { cellWidth: "auto" } },
      });

      const finalY = pdf.autoTable.previous.finalY;

      const allDeviceDetails = row.details.reduce((acc, detail) => {
        months.forEach((month) => {
          if (detail[month]) {
            acc.push({
              "Device ID": detail["Device ID"],
              Year: detail["year"],
              Month: month,
              Value: formatNumber(detail[month]),
            });
          }
        });
        return acc;
      }, []);

      const deviceColumns = [
        { header: "Device ID", dataKey: "Device ID" },
        { header: "Year", dataKey: "Year" },
        { header: "Month", dataKey: "Month" },
        { header: "Value", dataKey: "Value" },
      ];

      if (allDeviceDetails.length > 0) {
        pdf.autoTable(deviceColumns, allDeviceDetails, {
          startY: finalY + 10,
          margin: { horizontal: 14 },
          styles: { overflow: "linebreak", cellWidth: "wrap" },
          columnStyles: { text: { cellWidth: "auto" } },
        });
      }
    });

    pdf.save("transaction-data.pdf");
  };

  console.log(filteredData);
  const paginatedData = getPaginatedData(filteredData);


  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 border-2">
          <div className="sm:flex sm:items-start">
            <div className="w-full text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-white text-center bg-sky-800">
                Transaction List
              </h3>
              <button
                onClick={downloadAsPDF}
                className="bg-sky-700 hover:bg-sky-900 text-white font-bold py-2 px-4 rounded mt-4"
              >
                Download as PDF
              </button>
              <div>
                <input
                  type="radio"
                  id="all"
                  name="status"
                  value="All"
                  checked={statusFilter === "All"}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
                <label htmlFor="all">All</label>
                <input
                  type="radio"
                  id="active"
                  name="status"
                  value="Active"
                  className="ml-4"
                  checked={statusFilter === "Active"}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
                <label htmlFor="active">Active</label>
              </div>
              <div className="mt-2">
                <div className="py-2">
                  <input
                    type="text"
                    placeholder="Search organisation"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded-md p-2 border-sky-800"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <table className="table-auto w-full divide-y divide-gray-200 border-1">
                    <thead className="bg-sky-800 text-white rounded-md">
                      <tr>
                        <th className="px-4 py-2 text-xs font-medium  uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-4 py-2 text-xs font-medium  uppercase tracking-wider">
                          Organisation
                        </th>
                        <th className="px-4 py-2 text-xs font-medium  uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-2 text-xs font-medium  uppercase tracking-wider">
                          Requirement
                        </th>
                        <th className="px-4 py-2 text-xs font-medium  uppercase tracking-wider">
                          revoke order
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-left">
                      {paginatedData.map((row, i) => (
                        <React.Fragment key={i}>
                          <tr
                            onClick={() =>
                              activeRow === i
                                ? setActiveRow(null)
                                : setActiveRow(i)
                            }
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">
                              {row["Transaction ID"]}
                            </td>
                            <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">
                              {row["Organisation"]}
                            </td>
                            <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">
                              {row["Status"]}
                            </td>
                            <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">
                            {formatNumber(row["total"])}
                            </td>
                            <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">
  {row["Status"] !== "Revoked" ? (
    <button
      onClick={() => confirmDelete(row)}
      className="bg-red-200 rounded-md text-black p-1 hover:bg-red-300"
    >
      Revoke Txn
    </button>
  ) : (
    <button
      onClick={() => confirmUndo(row)}
      className="bg-green-200 rounded-md text-black p-1 hover:bg-green-300"
    >
      Undo Txn
    </button>
  )}
</td>
                          </tr>
                          {activeRow === i && (
                            <tr>
                              <td colSpan="5" className="px-4 py-4">
                                <div className="mx-auto w-full">
                                  <table className="w-full max-w-3/4 mx-auto text-sm border border-gray-400">
                                    <thead>
                                      <tr className="bg-gray-200">
                                        <th className="px-4 py-2 border-r border-gray-300">
                                          Device ID
                                        </th>
                                        <th className="px-4 py-2 border-r border-gray-300">
                                          Year
                                        </th>
                                        {months
                                          .filter((month) =>
                                            row.details.some(
                                              (detail) => detail[month]
                                            )
                                          )
                                          .map((month, index) => (
                                            <th
                                              key={index}
                                              className="px-4 py-2 border-r border-gray-300"
                                            >
                                              {month}
                                            </th>
                                          ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {row.details.map((detail, index) => (
                                        <tr
                                          key={index}
                                          className="border-t border-gray-300"
                                        >
                                          <td className="px-4 py-2 border-r border-gray-300">
                                            {detail["Device ID"]}
                                          </td>
                                          <td className="px-4 py-2 border-r border-gray-300">
                                            {detail["year"]}
                                          </td>
                                          {months
  .filter((month) => row.details.some((detail) => detail[month]))
  .map((month, monthIndex) => (
    <td 
      key={monthIndex} 
      className={`px-4 py-2 border-r border-gray-300 ${detail[month] ? 'hover:bg-violet-200 cursor-pointer' : ''}`} 
      onClick={() => { 
        if (detail[month]) {
          handleOpenDialog(detail[month]); 
          handleMonthClick(row["Transaction ID"], detail["Device ID"], month, row["year"], detail[month]); 
        }
      }} 
    > 
      {detail[month] ? formatNumber(detail[month]) : ""}
    </td>
))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Dialog open={dialogOpen} onClose={handleCloseDialog}>
  <DialogTitle>Edit Month Value</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Month Value"
      type="number"
      fullWidth
      value={currentMonthValue}
      onChange={(e) => setCurrentMonthValue(e.target.value)}
    />
    {actualValue && (
      <div>
        <h3>Actual Value:</h3>
        <p>{actualValue}</p>
      </div>
    )}
    {errorMessage && (
      <div>
        <p style={{ color: "red" }}>{errorMessage}</p>
      </div>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCancelDialog} color="primary">
      Cancel
    </Button>
    <Button onClick={handleCloseDialog} color="primary">
      Submit
    </Button>
  </DialogActions>
</Dialog>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
        <button
          onClick={goToPreviousPage}
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${currentPage === 1 ? 'opacity-50' : ''}`}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <p className="px-4 py-2 text-lg">{`Page ${currentPage} of ${totalPages}`}</p>
        <button
          onClick={goToNextPage}
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${currentPage === totalPages ? 'opacity-50' : ''}`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      </div>
    </div>
  );
}
