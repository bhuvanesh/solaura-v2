"use client"
import { useState, useEffect } from 'react';
import ReactLoading from 'react-loading';
import LoadingButton from '@/components/Loading';

const ErrorDataPage = () => {
  const [errorData, setErrorData] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [countRows, setCountRows] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/dash/error/errordata', {
          method: 'GET',
        });
        const data = await response.json();
        console.log(data)
        setErrorData(data.rows);
        setCountRows(data.countRows[0]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredData = errorData?.filter((item) => filter === 'all' || item.Status === filter) || [];

  const DataTable = ({ data, selectedRows, setSelectedRows }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <ReactLoading type="bars" color="#8000FF" />
        </div>
      );
    }

    return (
      <div style={{ overflowX: 'auto', height: '80vh' ,width:'83vw'}} className=" border-2 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 border rounded-md ">
          <thead className="">
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium bg-sky-800 text-white uppercase tracking-wider"
                >
                  {key === 'Status' ? 'Error Type' : key}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium bg-sky-800 text-white uppercase tracking-wider">
                Delete Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 cursor-pointer overflow-auto">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-100 focus:bg-slate-200" tabIndex={rowIndex}>
                {Object.values(row).map((value, valueIndex) => (
                  <td
                    key={valueIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-sky-800"
                  >
                    {value}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-800">
                  <input type="checkbox" checked={selectedRows.includes(row)} onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows([...selectedRows, row]);
                    } else {
                      setSelectedRows(selectedRows.filter((r) => r !== row));
                    }
                  }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleSubmit = async (selectedRows) => {
    setIsLoading(true);
    try {
      const response = await fetch('/dash/error/deletedata', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedRows),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Response:', data);
  
      // Show an alert with the response data and reload the page when the user clicks "OK"
      window.alert(data.message || 'Data deleted successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-violet-600 mb-4">Data Errors</h2>
      <div className="mb-4">
  <p className="text-lg font-semibold text-blue-600">No of Devices with Actual Error: <span className="font-normal text-gray-700">{countRows?.ActualDistinctDevices || 0}</span></p>
  <p className="text-lg font-semibold text-blue-600">No of Devices with Issued Error: <span className="font-normal text-gray-700">{countRows?.IssuedDistinctDevices || 0}</span></p>
</div>

      <div className="mb-4">
        <input type="radio" id="all" name="filter" value="all" checked={filter === 'all'} onChange={(e) => setFilter(e.target.value)} />
        <label htmlFor="all" className="mr-4">All</label>
        <input type="radio" id="actual" name="filter" value="Actual" checked={filter === 'Actual'} onChange={(e) => setFilter(e.target.value)} />
        <label htmlFor="actual" className="mr-4">Actual</label>
        <input type="radio" id="issued" name="filter" value="Issued" checked={filter === 'Issued'} onChange={(e) => setFilter(e.target.value)} />
        <label htmlFor="issued">Issued</label>
      </div>
      {filteredData.length > 0 ? (
        <>
             <LoadingButton 
            onClick={() => handleSubmit(selectedRows)}
            isLoading={isLoading}
            loadingLabel="Deleting..."
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 mb-4"
          >
            Delete
          </LoadingButton>
          <DataTable data={filteredData} selectedRows={selectedRows} setSelectedRows={setSelectedRows} />
        </>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <h2>No errors</h2>
        </div>
      )}
    </div>
  );
  
  
};

export default ErrorDataPage;
