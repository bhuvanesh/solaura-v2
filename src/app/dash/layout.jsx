"use client"
import ResultsContext from '../SearchContext/store'
import Sidebar from '@/components/sidebar/Sidebar'
import React, { useState } from "react";

const layout = ({children}) => {
  const [results, setResults] = useState([]);
  const [requirement, setRequirement] = useState(0);
  const [groupName, setGroupName] = React.useState('');
  const [organisation, setOrganisation] = React.useState('');

  return (
    <ResultsContext.Provider value={{
      results, setResults, 
      requirement, setRequirement,
      groupName, setGroupName: (newGroupName) => setGroupName(newGroupName),
      organisation, setOrganisation 
    }}>
    <div className="flex space-x-2">
           <Sidebar className=""/>
            {children}
        </div>
        </ResultsContext.Provider>

  )
}

export default layout