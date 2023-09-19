"use client"
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import ResultsContext from '@/app/SearchContext/store';


const FormComponent = () => {
  const { setResults, setRequirement, setOrganisation } = useContext(ResultsContext);
    const [requirement,_setRequirement] = useState("");
  const [CoDYear, setCoDYear] = useState("");
  const [productionPeriodFrom, setProductionPeriodFrom] = useState("");
  const [productionPeriodTo, setProductionPeriodTo] = useState("");
  const [type, setType] = useState("");
  const [organisation, _setOrganisation] = useState("");
  const router = useRouter();
  
  

  const handleSearch = async () => {
    // Perform search functionality here
    const response = await fetch('/api/table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirement,
        CoDYear,
        productionPeriodFrom,
        productionPeriodTo,
        type,
      }),
    });

    const results = await response.json();
    console.log('hello',results);
    
  if (!response.ok) {
    // Show error message and stop execution
    alert(results.message);
    return;
  }
  setResults(results);
  setRequirement(requirement);
  setOrganisation(organisation);
  router.push('/dash/allocate/results');
  
  
};



  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2013 }, (_, i) => currentYear - i);
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
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="organisation" className="block text-sm font-medium">
          Enter your organisation name
        </label>
        <input
          type="text"
          id="organisation"
          value={organisation}
          onChange={(e) => _setOrganisation(e.target.value)}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="requirement" className="block text-sm font-medium">
          Requirement (kWh)
        </label>
        <input
          type="number"
          id="requirement"
          value={requirement}
          onChange={(e) => _setRequirement(e.target.value)}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="CoDYear" className="block text-sm font-medium">
          CoD Year
        </label>
        <select
          id="CoDYear"
          value={CoDYear}
          onChange={(e) => setCoDYear(e.target.value)}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="productionPeriodFrom" className="block text-sm font-medium">
            Production Period From
          </label>
          <select
            id="productionPeriodFrom"
            value={productionPeriodFrom}
            onChange={(e) => setProductionPeriodFrom(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select month</option>
            {months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="productionPeriodTo" className="block text-sm font-medium">
            Production Period To
          </label>
          <select
            id="productionPeriodTo"
            value={productionPeriodTo}
            onChange={(e) => setProductionPeriodTo(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select month</option>
            {months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium">
          Type (Solar/Wind)
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select type</option>
          <option value="Solar">Solar</option>
          <option value="Wind">Wind</option>
        </select>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleSearch}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default FormComponent;