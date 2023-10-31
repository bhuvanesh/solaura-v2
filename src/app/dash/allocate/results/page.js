"use client"
import React, { useState , useEffect , useContext } from 'react';
import { useRouter } from 'next/navigation';
import ResultsContext from '@/app/SearchContext/store';
import { v4 as uuidv4 } from 'uuid';
import LoadingButton from '@/components/Loading';



const Results = () => {
  const { results, requirement ,organisation } = useContext(ResultsContext);
  const [selectedMonths, setSelectedMonths] = useState(new Map());
  const router = useRouter();
  const [remainingRequirement, setRemainingRequirement] = useState(parseInt(requirement));
  const [selectedTotalProduction, setSelectedTotalProduction] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [manipulatedResults, setManipulatedResults] = useState([...results]);

  
  const suggestMonths = () => {
    console.log("Starting Suggestion");
    removeSuggestion(() => {
      let suggestion = new Map();
      let remaining = parseInt(requirement);
      // Now it processes all devices sorted by production
      let sorted = [...results].sort((a, b) => b.Total_Production - a.Total_Production);
      outerLoop: for (let i = 0; i < sorted.length && remaining > 0; i++) {
        const result = sorted[i];
        const key = `${i}-Total_Production`;
        setSelectedTotalProduction((prev) => new Map(prev).set(key, true));
        for (const month of visibleMonths) {
          if (remaining <= 0) break outerLoop;
          let monthValue = parseInt(result[month]);
          let adjustedMonthValue = Math.min(monthValue, remaining);
          suggestion.set(`${i}-${month}`, true);
          result[month] = adjustedMonthValue;
          remaining -= adjustedMonthValue;
        }
      }
      setSelectedMonths(suggestion);
      setRemainingRequirement(remaining);
      console.log("Finished Suggestion");
    });
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
    setRemainingRequirement(parseInt(requirement));
  
    // Unselect the selected 'total production'
    setSelectedTotalProduction(new Map());
  };
  

  const [originalResults, setOriginalResults] = React.useState(null);
  useEffect(() => {
    setOriginalResults(JSON.parse(JSON.stringify(results)));
  }, [results]);
  const handleTotalProductionClick = (resultIndex) => {
    const key = `${resultIndex}-Total_Production`;
    const currentValue = selectedTotalProduction.get(key);
  
    if (currentValue) {
      setSelectedTotalProduction((prev) => new Map(prev).set(key, false));
  
      // Unselect the selected months when 'Total Production' is unselected
      visibleMonths.forEach((month) => {
        const monthKey = `${resultIndex}-${month}`;
        if (selectedMonths.get(monthKey)) {
          handleMonthClick(resultIndex, month);
        }
      });
    } else {
      if (remainingRequirement === 0) return;
  
      setSelectedTotalProduction((prev) => new Map(prev).set(key, true));
      let remaining = remainingRequirement;
  
      for (const month of visibleMonths) {
        if (remaining <= 0) break;
  
        const monthValue = parseInt(manipulatedResults[resultIndex][month]);
  
        // Check and adjust value
        let adjustedMonthValue = Math.min(monthValue, remaining);
  
        if(remaining >= monthValue) {
          remaining -= monthValue;
          handleMonthClick(resultIndex, month);
        } else {
          const key = `${resultIndex}-${month}`;
          let originalMonthValue = originalResults[resultIndex][month];
          results[resultIndex][month] = adjustedMonthValue;
          remaining -= adjustedMonthValue;
          setSelectedMonths((prev) => new Map(prev).set(key, !prev.get(key)));
        }
        // Ensure the remaining requirement stays at a minimum value of 0
        setRemainingRequirement(Math.max(0, remaining));
      }
    }
  };






const handleMonthClick = (resultIndex, month, adjustedMonthValue) => {
  const key = `${resultIndex}-${month}`;
  const currentValue = selectedMonths.get(key);
  let monthValue = parseInt(results[resultIndex][month]);
  let originalMonthValue = originalResults[resultIndex][month];

  // If unselecting a month
  if (currentValue) {
    setRemainingRequirement((prev) => prev + monthValue);
    // reset the value to original
    results[resultIndex][month] = originalMonthValue;
  } else {
    // already reached the requirement
    if (remainingRequirement == 0) return;

    // If the remaining requirement will be exceeded by the selected month
    if (remainingRequirement - originalMonthValue < 0) {
      manipulatedResults[resultIndex][month] = remainingRequirement;
      setRemainingRequirement(0);
    } else {
      if (adjustedMonthValue) {
        // Use the adjustedMonthValue when provided
        results[resultIndex][month] = adjustedMonthValue;
        setRemainingRequirement((prev) => prev - adjustedMonthValue);
      } else {
        setRemainingRequirement((prev) => prev - monthValue);
      }
    }
  }
  // Toggle the month selection state
  setSelectedMonths((prev) => new Map(prev).set(key, !prev.get(key)));
};


  const handleSubmit = async () => {
    setIsLoading(true);
    let remainingRequirement = parseInt(requirement);
    const selectedMonthsObject = {};
    let year = null;

  
    selectedMonths.forEach((value, key) => {
      if (value && remainingRequirement > 0) {
        const [resultIndex, month] = key.split('-');
        const deviceId = results[parseInt(resultIndex)]['Device ID'];
        if (!selectedMonthsObject[deviceId]) {
          selectedMonthsObject[deviceId] = {};
        }
        if (!year) {
          year = results[parseInt(resultIndex)]['Year'];
        }
  
        const monthValue = results[parseInt(resultIndex)][month];
        const adjustedMonthValue = Math.min(remainingRequirement, monthValue);
        selectedMonthsObject[deviceId][month] = adjustedMonthValue;
        remainingRequirement -= adjustedMonthValue;
      }
    });
  
    const response = await fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedMonthsObject),
    });
    const updatedResults = await response.json();
    console.log(updatedResults);
  
    if (updatedResults.message === 'Database updated successfully') {
      alert('Your order placed');
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
        alert('Error updating Buyer Database');
      }
    } else {
      alert('Error updating Database');
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
        </tr>
      </thead>
      <tbody>
        {results.map((result, index) => (
          <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
            <td className="border px-4 py-2">{result["Device ID"]}</td>
            <td className="border px-4 py-2">{result.Year}</td>
            <td className="border px-4 py-2">{result.Type}</td>
            <td className="border px-4 py-2">{result.CoD}</td>
            <td
  className={`border px-4 py-2 cursor-pointer hover:bg-indigo-100 ${
    selectedTotalProduction.get(`${index}-Total_Production`)
      ? "bg-indigo-200"
      : ""
  }`}
  onClick={() => handleTotalProductionClick(index)}
>
  {selectedTotalProduction.get(`${index}-Total_Production`)
    ? (() => {

        const filteredKeys = Array.from(selectedMonths.keys())
          .filter((key) => key.startsWith(index + "-"));
        const result = filteredKeys.reduce(
          (sum, key) => sum + parseInt(results[index][key.split("-")[1]]),
          0
        );
        return result;
      })()
    : result.Total_Production
  }
</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
};

export default Results;