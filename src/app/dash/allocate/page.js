"use client"
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import ResultsContext from '@/app/SearchContext/store';
import LoadingButton from '@/components/Loading';


const FormComponent = () => {
  const { setResults, setRequirement, setOrganisation } = useContext(ResultsContext);
    const [requirement,_setRequirement] = useState("");
  const [CoDYear, setCoDYear] = useState("");
  const [productionPeriodFrom, setProductionPeriodFrom] = useState("");
  const [productionPeriodTo, setProductionPeriodTo] = useState("");
  const [type, setType] = useState("");
  const [organisation, _setOrganisation] = useState("");
  const [year, setYear] = useState("");
  const router = useRouter();
  const [loadingState, setLoadingState] = useState(false);

  
  

  const handleSearch = async () => {
    setLoadingState(true);
    const currentYear = new Date().getFullYear();
    let actualCoDYear;
    if (CoDYear === 'within5') {
      actualCoDYear = currentYear - 5;
    } else if (CoDYear === 'within10') {
      actualCoDYear = currentYear - 10;
    } else if (CoDYear === 'morethan10') {
      actualCoDYear = 0;
    }
    const response = await fetch('/api/table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirement,
        CoDYear: actualCoDYear,
        productionPeriodFrom,
        productionPeriodTo,
        type,
        year,
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
  setLoadingState(false);
  
};




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
  
    <div className='p-8'>
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
          className="p-1 block w-full mt-1 border-sky-800 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          className="p-1  border-sky-800 border block w-full mt-1 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
  <label htmlFor="year" className="block text-sm font-medium">Year</label>
  <select
    id="year"
    value={year}
    onChange={(e) => setYear(e.target.value)}
    className="p-2 border-sky-800 border block w-full mt-1 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  >
    <option value="">Select year</option>
    <option value="2022">2022</option>
    <option value="2023">2023</option>
  </select>
</div>

      <div>
        <label htmlFor="CoDYear" className="block text-sm font-medium">
          CoD Year
        </label>
        <select
          id="CoDYear"
          value={CoDYear}
          onChange={(e) => setCoDYear(e.target.value)}
          className="p-2 border-sky-800 border block w-full mt-1 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select year</option>
          <option value="within5">Within 5 years</option>
          <option value="within10">Within 10 years</option>
          <option value="morethan10">More than 10 years</option>
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
            className=" p-2 border-sky-800 border block w-full mt-1  rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            className="p-2 border-sky-800 border block w-full mt-1  rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          className="p-2 border-sky-800 border block w-full mt-1  rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select type</option>
          <option value="Solar">Solar</option>
          <option value="Wind">Wind</option>
          <option value="Both">Both</option>
        </select>
      </div>
      <div className="flex justify-end space-x-4">
      <LoadingButton
          type="button"
          onClick={handleSearch}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-800 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          isLoading={loadingState}
          loadingLabel="Searching"
        >
          Search
        </LoadingButton>
      </div>
    </div>
    </div>
    
  );
};

export default FormComponent;