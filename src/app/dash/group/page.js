"use client"
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Transition } from '@headlessui/react';





const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/group'); // Replace '/api/groups' with the path to your API route
        const data = await response.json();
        setGroups(data);

        // Set the first group as the selected group
        if (data.length > 0) {
          setSelectedGroup(data[0].Group);
          setSelectedGroupDetails(data[0]);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, []);
  const handleDownload = () => {
    const doc = new jsPDF();
    const groupName = selectedGroup;
  const groupDetails = [
  { key: 'No. of Devices', value: selectedGroupDetails.no_of_devices },
  { key: 'Estimated Generation', value: `${selectedGroupDetails.estimated_generation} kWh` },
  { key: 'Actual Generation', value: `${selectedGroupDetails.actual_generation} kWh` },
  { key: 'Total Issuance', value: `${selectedGroupDetails.total_issuance} kWh` },
  { key: 'Future Commitment', value: `${selectedGroupDetails.future_commitment} kWh` },
];
  
    doc.setFontSize(18);
    doc.text(groupName, 10, 10);
  
    doc.autoTable({
      startY: 30,
      body: groupDetails.map((detail) => [detail.key, detail.value]),
    });
  
    doc.save(`${groupName}.pdf`);
  };
  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
    const groupDetails = groups.find((group) => group.Group === event.target.value);
    setSelectedGroupDetails(groupDetails);
  };

return (
    <div className="main-content" style={{ marginLeft: '400px', padding: '1rem' }}>
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <button onClick={handleDownload} className="mt-4 bg-cyan-400 text-white px-4 py-2 rounded-md">
          Download as PDF
        </button>
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <h1 className="text-2xl font-semibold text-center mb-6">Select a Group</h1>
            <div className="w-full">
              <select value={selectedGroup} onChange={handleGroupChange} className="w-full p-2 mb-6 text-center text-gray-600 text-sm bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400">
                {groups.map((group) => (
                  <option key={group.Group} value={group.Group}>
                    {group.Group}
                  </option>
                ))}
              </select>
            </div>
            {selectedGroupDetails && (
              <Transition
                show={selectedGroupDetails !== null}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-4">Group Details</h2>
                  <ul className="space-y-2">
                    <li>No. of Devices: {selectedGroupDetails.no_of_devices}</li>
                    <li>Estimated Generation: {selectedGroupDetails.estimated_generation}KWh</li>
                    <li>Actual Generation: {selectedGroupDetails.actual_generation}KWh</li>
                    <li>Total Issuance: {selectedGroupDetails.total_issuance}KWh</li>
                    <li>Future Commitment: {selectedGroupDetails.future_commitment}KWh</li>
                  </ul>
                </div>
              </Transition>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Groups;