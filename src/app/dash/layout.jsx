"use client"
import React, { useState } from "react";
import ResultsContext from '../SearchContext/store'
import Sidebar from '@/components/sidebar/Sidebar'

const Layout = ({children}) => {
  const [results, setResults] = useState([]);
  const [requirement, setRequirement] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [CoDYear, setCoDYear] = useState('');
  const [productionPeriodFrom, setProductionPeriodFrom] = useState('');
  const [productionPeriodTo, setProductionPeriodTo] = useState('');
  const [type, setType] = useState('');
  const [draftData, setDraftData] = useState({}); 

  return (
    <ResultsContext.Provider value={{
      results, setResults, 
      requirement, setRequirement,
      groupName, setGroupName,
      organisation, setOrganisation,
      CoDYear, setCoDYear,
      productionPeriodFrom, setProductionPeriodFrom,
      productionPeriodTo, setProductionPeriodTo,
      type, setType,
      draftData, setDraftData // Now providing these to context
    }}>
      <div className="flex space-x-2">
        <Sidebar className=""/>
        {children}
      </div>
    </ResultsContext.Provider>
  );
}

export default Layout;
