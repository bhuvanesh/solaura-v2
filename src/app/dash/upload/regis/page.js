"use client"
import { useState } from 'react';

const FormPage = () => {
  const [formData, setFormData] = useState({
    groupName: '',
    companyName: '',
    projectName: '',
    capacity: '',
    deviceId: '',
    cod: '',
    deviceType: '',
    months: Array(12).fill(0),
    registered: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMonthChange = (index, value) => {
    const newMonths = [...formData.months];
    newMonths[index] = value;
    setFormData({ ...formData, months: newMonths });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const modifiedData = formData.months.reduce((acc, monthValue, index) => {
    
        const monthName = new Date(2023, index).toLocaleString('default', { month: 'long' });
        acc.push({
          groupName: formData.groupName,
          companyName: formData.companyName,
          projectName: formData.projectName,
          capacity: parseFloat(formData.capacity),
          'Device Id': formData.deviceId,
          CoD: formData.cod,
          Type: formData.deviceType,
          registered: formData.registered,
          month: monthName,
          Estimated: parseInt(monthValue, 10),
        });
      
      return acc;
    }, []);

    const response = await fetch('/api/regis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modifiedData),
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Group Name:</label>
          <input
            type="text"
            name="groupName"
            value={formData.groupName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium">Company Name:</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium">Project Name:</label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium">Capacity (MW):</label>
          <input
            type="number"
            step="0.01"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium">Device ID:</label>
          <input
            type="text"
            name="deviceId"
            value={formData.deviceId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium">CoD:</label>
          <input
            type="date"
            name="cod"
            value={formData.cod}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium">Device Type:</label>
          <select
            name="deviceType"
            value={formData.deviceType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select device type</option>
            <option value="Wind">Wind</option>
            <option value="Solar">Solar</option>
          </select>
        </div>
  
        {formData.months.map((monthValue, index) => (
          <div key={index}>
            <label className="block text-sm font-medium">
              {new Date(2023, index).toLocaleString('default', { month: 'long' })}-(kWh):
            </label>
            <input
              type="number"
              name={`month-${index}`}
              value={monthValue}
              onChange={(e) => handleMonthChange(index, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        ))}
  
        <div>
          <label className="block text-sm font-medium">Registered:</label>
          <select
            name="registered"
            value={formData.registered}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select status</option>
            <option value="Yes">Yes</option>
            <option value="Pending">Pending</option>
            <option value="Pipeline">Pipeline</option>
          </select>
        </div>
  
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>
    </div>
  );
        } 
  export default FormPage;