"use client";
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

async function fetchData() {
  const response = await fetch("/dash/txnmerge/btable");
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
  const [searchQuery, setSearchQuery] = useState(""); 
  const [statusFilter, setStatusFilter] = useState("Active");
  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowClick = (i) => {
    if (activeRow === i){
      setActiveRow(null);
    } else {
      setActiveRow(i);
    }
  };

  const handleCheckboxChange = (event, row) => {
    const { checked } = event.target;
    setSelectedRows((prev) => {
      if (checked) {
        if (prev.length > 0) {
          const firstSelectedRow = data.find(d => d["Transaction ID"] === prev[0]);
          if (firstSelectedRow["Organisation"].toLowerCase() !== row["Organisation"].toLowerCase()) {
            window.alert("The merger is not of the same organisation");
            return prev;
          }
        }
        return [...prev, row["Transaction ID"]];
      } else {
        return prev.filter(id => id !== row["Transaction ID"]);
      }
    });
  };

  
  const handleSubmit = async () => {
    if (selectedRows.length > 0) {
      const firstSelectedRow = data.find(d => d["Transaction ID"] === selectedRows[0]);
      let organisationName = firstSelectedRow["Organisation"];
      if (organisationName.toLowerCase().startsWith("tmp_")) {
        organisationName = organisationName.slice(4); // remove "tmp_" from the start
      }
      const transactionIds = selectedRows;
      await handleDelete(organisationName, transactionIds);
    }
  };
   
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  
  const handleDelete = async (organisationName, transactionIds) => {
    const response = await fetch("/dash/txnmerge/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ organisationName, transactionIds }),
    });
  
    if(response.ok) {
      const data = await response.json();
      console.log(data);
      window.alert(JSON.stringify(data, null, 2)); 
      window.location.reload(); 
    } else {
      console.error(`Server responded with ${response.status}`);
    }
};

  useEffect(() => {
    fetchData().then((data) => {
      // Group data by Transaction ID
      const groupedData = data.reduce((acc, row) => {
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
    });
  }, []);

  const filteredData = data.filter((item) => {
    return (
      item["Organisation"].toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === "All" || item["Status"] === "succeeded") &&
      item["Organisation"].toLowerCase().includes("tmp_")
    );
  });



  console.log(filteredData);

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
                onClick={handleSubmit}
                className="bg-sky-700 hover:bg-sky-900 text-white font-bold py-2 px-4 rounded mt-4"
              >
                click here to Merge
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
                          Merge order
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-left">
                      {filteredData.map((row, i) => (
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
                              <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">
                              {row["Status"] !== "Revoked" && row["Organisation"].toLowerCase().startsWith("tmp_") && (
    <input
      type="checkbox"
      checked={selectedRows.includes(row["Transaction ID"])}
      onClick={(e) => e.stopPropagation()} 
      onChange={(e) => handleCheckboxChange(e, row)}
    />
  )}
                              </td>
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
                                          .filter((month) =>
                                            row.details.some(
                                              (detail) => detail[month]
                                            )
                                          )
                                          .map((month, monthIndex) =>  (
                                              <td
                                                key={monthIndex}
                                                className="px-4 py-2 border-r border-gray-300"
                                              >
                                                 {detail[month] ? formatNumber(detail[month]) : ''}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
