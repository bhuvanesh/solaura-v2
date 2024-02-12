"use client"
import React, { useState, useContext,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResultsContext from '@/app/SearchContext/store';
import LoadingButton from '@/components/Loading';
import DraftButton from '../draft/draft';


const FormComponent = () => {
  const {
    setResults,
    setRequirement,
    setOrganisation,
    setCoDYear,
    setProductionPeriodFrom,
    setProductionPeriodTo,
    setType,
    setDraftData,
    setdraftid,
  } = useContext(ResultsContext);
  const [requirement, _setRequirement] = useState("");
  const [CoDYear, _setCoDYear] = useState("");
  const [productionPeriodFrom, _setProductionPeriodFrom] = useState("");
  const [productionPeriodTo, _setProductionPeriodTo] = useState("");
  const [type, _setType] = useState("");
  const [organisation, _setOrganisation] = useState("");
  const [year, setYear] = useState("");
  const router = useRouter();
  const [loadingState, setLoadingState] = useState(false);

  const [searchTrigger, setSearchTrigger] = useState(false); 
  const isDraftToggleOn = process.env.NEXT_PUBLIC_DRAFT_TOGGLE === 'on';

  useEffect(() => {
    // This effect runs whenever searchTrigger is changed and is true.
    if (searchTrigger) {
      handleSearch();
      setSearchTrigger(false); 
    }
  }, [searchTrigger]);

  const handleApplyDraftData = async (data) => {
    const { Year, ...otherDraftDataProperties } = data.Draft_Data || {};

    _setRequirement(data.requirement || "");
    _setOrganisation(data.Organisation || "");
    _setProductionPeriodFrom(data.productionPeriodFrom || "");
    _setProductionPeriodTo(data.productionPeriodTo || "");
    _setType(data.type || "");
    _setCoDYear(data.CoDYear || "");
    setYear(data.Year || ""); 
    setdraftid(data.draft_id || "");
  
    
    setDraftData(data.devicedata || "");    
    setSearchTrigger(true);
  };
  

  const handleSearch = async () => {
    setLoadingState(true);
    const currentYear = new Date().getFullYear();
    let actualCoDYear;
    if (CoDYear === 'within5') {
      actualCoDYear = currentYear - 5;
    } else if (CoDYear === 'within10') {
      actualCoDYear = currentYear - 10;
    } else if (CoDYear === 'within15') {
      actualCoDYear = currentYear - 15;
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
  setCoDYear(CoDYear);
  setProductionPeriodFrom(productionPeriodFrom);
  setProductionPeriodTo(productionPeriodTo);
  setType(type);
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2021 }, (_, i) => 2022 + i);

  return (
  
    <div className='p-8'>
    {/* Grid Container */}
    <div className="grid grid-cols-2 gap-8">
      {/* Form section */}
      <div className="space-y-4 col-span-1">
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
            Requirement (MWh)
          </label>
          <input
            type="number"
            id="requirement"
            value={requirement}
            onChange={(e) => _setRequirement(e.target.value)}
            className="p-1 block w-full mt-1 border-sky-800 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium">Year</label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="p-2 block w-full mt-1 border-sky-800 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="CoDYear" className="block text-sm font-medium">
            CoD Year
          </label>
          <select
            id="CoDYear"
            value={CoDYear}
            onChange={(e) => _setCoDYear(e.target.value)}
            className="p-2 block w-full mt-1 border-sky-800 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select year</option>
            <option value="within5">Upto 5 years</option>
            <option value="within10">Upto 10 years</option>
            <option value="within15">Upto 15 years</option>
            <option value="morethan10">All Devices</option>
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
              onChange={(e) => _setProductionPeriodFrom(e.target.value)}
              className="p-2 block w-full mt-1 border-sky-800 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              onChange={(e) => _setProductionPeriodTo(e.target.value)}
              className="p-2 block w-full mt-1 border-sky-800 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            onChange={(e) => _setType(e.target.value)}
            className="p-2 block w-full mt-1 border-sky-800 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
      {isDraftToggleOn && (
        <div className="space-y-4 col-span-1 flex flex-col justify-start">
          <h className="text-2xl font-semibold text-sky-800">Saved Drafts</h>
          <DraftButton onApply={handleApplyDraftData} />
        </div>
      )}
    </div>
  </div>
  
  );
};

export default FormComponent;