"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import DataTable from "@/components/DataTable";


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
  const downloadAsExcel = () => {
    // Filter data for the selected year
    const filteredData = data.filter(item => item["Year"] === selectedYear);
  
    // Replace 'Reserved' or 'Sold' with 0
    const modifiedData = filteredData.map(item => {
      const newItem = {};
      for (const key in item) {
        if (item[key] === "Reserved" || item[key] === "Sold") {
          newItem[key] = 0;
        } else {
          newItem[key] = isNaN(Number(item[key])) ? item[key] : Number(item[key]);
        }
      }
      return newItem;
    });
  
    // Convert the modified data to an Excel file
    const ws = XLSX.utils.json_to_sheet(modifiedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "data.xlsx");
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

  const filteredData = selectedGroup.toLowerCase() === "all groups" ? data.filter(item => item["Year"] === selectedYear) : data.filter( (item) => item["Group"].toLowerCase() === selectedGroup.toLowerCase() && item["Year"] === selectedYear );

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
          <DataTable data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
