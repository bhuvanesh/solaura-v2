"use client"
import React, { useState , useEffect , useContext } from 'react';
import { useRouter } from 'next/navigation';
import ResultsContext from '@/app/SearchContext/store';
import { v4 as uuidv4 } from 'uuid';
import LoadingButton from '@/components/Loading';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function calcTotal(obj, monthArray) {
  monthArray.reduce((sum, month) => sum + parseFloat(obj[month]), 0);

}

const Results = () => {
  const { results, requirement ,organisation } = useContext(ResultsContext);
  const [selectedMonths, setSelectedMonths] = useState(new Map());
  const router = useRouter();
  const [remainingRequirement, setRemainingRequirement] = useState(parseFloat(requirement));
  const [isLoading, setIsLoading] = useState(false);
  const [manipulatedResults, setManipulatedResults] = useState([...results]);
  const [open, setOpen] = useState(false); 
const [editKey, setEditKey] = useState(''); 
const [editValue, setEditValue] = useState(0);
const [oldValue, setOldValue] = useState(0); 


const handleClose = () => {
  setOpen(false);
};

const handleOpen = (key, value, oldValue) => {
  setEditKey(key);
  setEditValue(value);
  setOldValue(oldValue);
  setOpen(true);  
};
const handleUnselect = () => {
  const [resultIndex, month] = editKey.split("-");
  setRemainingRequirement(prev => prev + parseFloat(results[resultIndex][month]));
  results[resultIndex][month] = originalResults[resultIndex][month];
  setSelectedMonths(prev => new Map(prev).set(editKey, false));
  handleClose();
};


  const suggestMonths = () => {
    console.log("Starting Suggestion");
    let suggestion = new Map();
    let remaining = parseFloat(requirement);
    let sorted = [...results].sort((a, b) => calcTotal(b, visibleMonths) - calcTotal(a, visibleMonths));
    outerLoop: for (let i = 0; i < sorted.length && remaining > 0; i++) {
    const result = sorted[i];
    for (const month of visibleMonths) {
      if (remaining <= 0) break outerLoop;
      let monthValue = parseFloat(result[month]);
      let adjustedMonthValue = Math.min(monthValue, remaining);
      suggestion.set(`${i}-${month}`, true);
      result[month] = adjustedMonthValue;
      remaining -= adjustedMonthValue;
      }
    }
    setSelectedMonths(suggestion);
    setRemainingRequirement(parseFloat(remaining.toFixed(4)));
    console.log("Finished Suggestion");
  };

  const removeSuggestion = (callback) => {
    setSelectedMonths(prev => {
      const map = new Map();
      for (const [key, value] of prev) {
        if (!value) continue;
        const [resultIndex, month] = key.split("-");
        //reset results here
        results[resultIndex][month] = originalResults[resultIndex][month];
      }
      if (typeof callback === 'function') {
        callback();
      }
      return map;
    });
    setRemainingRequirement(parseFloat(parseFloat(requirement).toFixed(4)));
  
   
  };
  const [originalResults, setOriginalResults] = React.useState(null);
  useEffect(() => {
    setOriginalResults(JSON.parse(JSON.stringify(results)));
  }, [results]);

  const handleMonthClick = (resultIndex, month, adjustedMonthValue) => {
    const key = `${resultIndex}-${month}`;
    const currentValue = selectedMonths.get(key);
    let monthValue = parseFloat(results[resultIndex][month]);
    let originalMonthValue = originalResults[resultIndex][month];
    if (!currentValue) {
      if (remainingRequirement === 0) return;
      if (remainingRequirement - monthValue < 0) {
        results[resultIndex][month] = remainingRequirement;
        setRemainingRequirement(0);
      } else {
        if (remainingRequirement >= monthValue) {
          setRemainingRequirement(prev => parseFloat((prev - monthValue).toFixed(4)));
        } else {
          toast.error("Month value exceeded remaining requirement"); 
          return;
        }
      }
      setSelectedMonths((prev) => new Map(prev).set(key, true));
    } else {
      setOpen(true);
      setOldValue(monthValue);
      setEditKey(key);
      setEditValue(results[resultIndex][month].toString());
    }
  };
  const handleEdit = () => {
    const [resultIndex, month] = editKey.split("-");
    const newMonthValue = parseFloat(editValue);
    let currentMonthValue = results[resultIndex][month];
  
    if (newMonthValue < 0 || newMonthValue > currentMonthValue){
      toast.warning("Invalid input. Please input a value between 0 and " + currentMonthValue);
      return;
    }
  
    const difference = newMonthValue - oldValue;
  
    if (difference > 0) {
      if (difference <= remainingRequirement) {
          setRemainingRequirement(prev => parseFloat((prev - difference).toFixed(4)));

      } else {
        toast.warning("The value you entered exceeded the remaining requirement.");
          return;
      }
    }
  
    if (difference < 0) {
      setRemainingRequirement(prev => parseFloat((prev - difference).toFixed(4)));

    }
  
    results[resultIndex][month] = newMonthValue;  
  
    handleClose();
    setSelectedMonths(prev => new Map(prev).set(editKey, true)); 
  }


  const handleSubmit = async () => {
    setIsLoading(true);
    let remainingRequirement = parseFloat(requirement);
    const selectedMonthsObject = {};
    let year = null;

  
    selectedMonths.forEach((value, key) => {
      if (value && remainingRequirement > 0) {
        const [resultIndex, month] = key.split('-');
        const deviceId = results[parseFloat(resultIndex)]['Device ID'];
        if (!selectedMonthsObject[deviceId]) {
          selectedMonthsObject[deviceId] = {};
        }
        if (!year) {
          year = results[parseFloat(resultIndex)]['Year'];
        }
  
        const monthValue = results[parseFloat(resultIndex)][month];
        const adjustedMonthValue = Math.min(remainingRequirement, monthValue);
        selectedMonthsObject[deviceId][month] = adjustedMonthValue;
        remainingRequirement -= adjustedMonthValue;
      }
    });
    selectedMonthsObject['Year'] = year;
    const response = await fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedMonthsObject),
    });
    const updatedResults = await response.json();
    console.log(updatedResults);
  
    if (updatedResults.message === 'Database updated successfully') {
      toast.success('Your order placed');
      const uniqueId = uuidv4();
      const response = await fetch('/api/buyer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organisation, selectedMonths: selectedMonthsObject, uniqueId, year }),
      });
  
      const buyerResponse = await response.json();
      if (buyerResponse.message === 'Buyer Database updated successfully!') {
        router.push(`/dash/allocate/results/payment?uniqueId=${uniqueId}`);
      } else {
        toast.error('Error updating Buyer Database');
      }
    } else {
      toast.error('Error updating Database');
    }
    setIsLoading(false);

  };
  

  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const visibleMonths = months.filter(month => results.some(result => result[month]));
  useEffect(() => {
    suggestMonths();
}, []);


return (
  <div className="container mx-auto px-4">
    <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      <p>Requirement: {remainingRequirement}</p>
      <div>
        <button
          type="button"
          onClick={suggestMonths}
          className="inline-flex items-center px-4 py-2 mr-2 text-sm font-medium text-white bg-teal-400 border border-transparent rounded-md shadow-sm hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Apply Suggestions
        </button>
        <button
          type="button"
          onClick={removeSuggestion}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Remove Suggestions
        </button>
      </div>
      <div className="flex justify-end pb-2">
      <LoadingButton
    loadingLabel="Submitting"
    isLoading={isLoading}
    onClick={handleSubmit}
    color="primary"
    variant="contained"
  >
    Submit
  </LoadingButton>
      </div>
      <table className="w-full table-auto border-collapse">
       <thead className=''>
    <tr className="bg-sky-800 text-white">
      <th className="px-4 py-2">Device ID</th>
      <th className="px-4 py-2">Year</th>
      <th className="px-4 py-2">Type</th>
      <th className="px-4 py-2">CoD</th>
      <th className="px-4 py-2">Total Production</th>
      {visibleMonths.map((month, index) => (
        <th key={index} className="px-4 py-2">{month.charAt(0).toUpperCase() + month.slice(1)}</th>
      ))}
    </tr>
  </thead>
  <tbody>
  {results
    .filter(result => parseFloat(result.Total_Production) > 0) // Filter out rows with Total_Production of zero
    .map((result, index) => (
      <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
        <td className="border px-4 py-2">{result["Device ID"]}</td>
        <td className="border px-4 py-2">{result.Year}</td>
        <td className="border px-4 py-2">{result.Type}</td>
        <td className="border px-4 py-2">{result.CoD}</td>
        <td className="border px-4 py-2">{result.Total_Production}</td>
        {visibleMonths.map((month, monthIndex) => (
          <td key={monthIndex} className={`border px-4 py-2 cursor-pointer hover:bg-indigo-100 ${selectedMonths.get(`${index}-${month}`) ? "bg-indigo-200" : ""}`} onClick={() => handleMonthClick(index, month)} >
            {result[month]}
          </td>
        ))}
      </tr>
    ))
  }
</tbody>
  </table>
  <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit your Requirement</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Requirement"
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button color="secondary" onClick={handleUnselect}>Unselect</Button>
        <Button onClick={handleEdit}>Save</Button>
      </DialogActions>
    </Dialog>
</div>);
};

export default Results;