import React from 'react';

const ResultsContext = React.createContext({
  results: [],
  requirement: 0,
  groupName: '',
  organisation: '',
  CoDYear: '',
  productionPeriodFrom: '',
  productionPeriodTo: '',
  type: '',
  draftData: {}, 
  draftid: '', 
  setResults: () => {},
  setRequirement: () => {},
  setGroupName: () => {},
  setOrganisation: () => {},
  setCoDYear: () => {},
  setProductionPeriodFrom: () => {},
  setProductionPeriodTo: () => {},
  setType: () => {},
  setDraftData: () => {}, 
  setdraftid: () => {}, 
});

export default ResultsContext;
