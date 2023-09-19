import React from 'react';

const ResultsContext = React.createContext({
  results: [],
  requirement: 0,
  groupName: '',
  organisation: '', 
  setResults: () => {},
  setRequirement: () => {},
  setGroupName: () => {},
  setOrganisation: () => {}, 
});

export default ResultsContext;