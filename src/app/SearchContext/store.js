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
  setResults: () => {},
  setRequirement: () => {},
  setGroupName: () => {},
  setOrganisation: () => {},
  setCoDYear: () => {},
  setProductionPeriodFrom: () => {},
  setProductionPeriodTo: () => {},
  setType: () => {},
  setDraftData: () => {}, 
});

export default ResultsContext;
