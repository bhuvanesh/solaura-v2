"use client";
import { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import DataTable from "@/components/DataTable";
import React from 'react';

const DownloadPage = () => {
  const [groups, setGroups] = useState([]);
  const [data, setData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [unfilteredGroups, setUnfilteredGroups] = useState([]);

  // Fetch the groups when the component mounts
  useEffect(() => {
    const fetchGroups = async () => {
      const response = await fetch("/api/sum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      const allGroupsOption = {Group: "All groups", Year: "All years"};
      data.unshift(allGroupsOption);
      setUnfilteredGroups(data);
      if (data[1]) {   
        setSelectedGroup(data[1].Group);
        setSelectedYear(data[1].Year);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    // Filter the unfilteredGroups based on the selected year
    const filteredGroups = unfilteredGroups.filter(group => group.Year === selectedYear || group.Group === "All groups");
    setGroups(filteredGroups);
  }, [selectedYear]);

  // Fetch the data when the selected group changes
  useEffect(() => {
    if (selectedGroup) {
      const fetchGroupDetails = async () => {
        const response = await fetch("/api/sum", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ group: selectedGroup }),
        });

        const data = await response.json();
        setData(data);
        console.log(data);
        const uniqueYears = Array.from(new Set(data.map((item) => item["Year"])));
        const years = uniqueYears.sort((a, b) => Number(b) - Number(a));
        setSelectedYear(years[0]);
      };
      fetchGroupDetails();
    }
  }, [selectedGroup]);

  const downloadAsExcel = async () => {
    // Filter data for the selected year
    const filteredData = data.filter(item => item["Year"] === selectedYear);

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add headers
    const headers = Object.keys(filteredData[0]);
    worksheet.addRow(headers);

    // Add data
    filteredData.forEach(row => {
      const newRow = worksheet.addRow(Object.values(row));
      newRow.eachCell((cell, colNumber) => {
        if (cell.value === "Sold") {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD0F0D0' } // Light green
          };
        } else if (cell.value === "Reserved") {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '68a617' } // Dark green
          };
        } else if (typeof cell.value === 'string' && cell.value.includes('(Est.)')) {
          cell.value = parseFloat(cell.value.replace(' (Est.)', ''));
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'f7cd83' } // Orange
          };
        } else if (typeof cell.value === 'string' && cell.value.includes('(Isd.)')) {
          cell.value = parseFloat(cell.value.replace(' (Isd.)', ''));
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'f24b83' } // Light green
          };
        } else if (cell.value !== "Sold" && cell.value !== "Reserved") {
          cell.value = parseFloat(cell.value) || 0;
        }
      });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.xlsx';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const formatData = (data) => {
    return data.map(item => {
      const newItem = {...item};
      for (const key in newItem) {
        if (newItem[key] === "Sold") {
          newItem[key] = React.createElement('span', {style: {fontWeight: 'bold', color: 'navy'}}, 'Sold');
        } else if (newItem[key] === "Reserved") {
          newItem[key] = React.createElement('span', {style: {textDecoration: 'underline',color: 'green',fontWeight: 'bold'}}, 'Reserved');
        }
      }
      return newItem;
    });
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const uniqueGroups = Array.from(new Set(data.map((item) => item["Group"])));

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };  
  const uniqueYears = Array.from(new Set(data.map((item) => item["Year"])));
  const years = uniqueYears.sort((a, b) => b - a);

  const filteredData = selectedGroup.toLowerCase() === "all groups" 
    ? data.filter(item => item["Year"] === selectedYear) 
    : data.filter((item) => item["Group"].toLowerCase() === selectedGroup.toLowerCase() && item["Year"] === selectedYear);

  const formattedData = formatData(filteredData);

  return (
    <div className="DownloadPage">
      <div className="py-2">
        <h1 className="text-white bg-sky-800 text-center w-full">
          Device Summary
        </h1>
      </div>
      <button
        onClick={downloadAsExcel}
        className="bg-sky-800 hover:bg-sky-700 text-white px-4 py-2 rounded"
      >
        Download as Excel
      </button>
      <div className="pt-8 pb-4">
        <span className="">
        <select
  value={selectedGroup}
  onChange={handleGroupChange}
  className="border px-4 py-2 rounded-md border-sky-800"
>
  {groups.sort((a, b) => {
    if(a.Group === "All groups") return -1;
    if(b.Group === "All groups") return 1;
    if(a.Group && b.Group) {
      return a.Group.localeCompare(b.Group)
    }
    return 0;
  }).map((group, index) => (
    <option key={index} value={group.Group}>
      {group.Group}
    </option>
  ))}
</select>
        </span>
        {selectedYear && (
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="border px-4 py-2 rounded-md border-sky-800"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
        <div className="pt-4">
          <DataTable data={formattedData} />
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
