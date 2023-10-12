"use client"
import { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';




const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);


  const handleDownload = async () => {
    const logoUrl = 'https://i.imgur.com/1Tl8SjL.jpg';
    const logoResponse = await fetch(logoUrl);
    const logoBlob = await logoResponse.blob();
    const logoBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(logoBlob);
    });
  
    const doc = new jsPDF();
    const groupName = selectedGroup;
    const groupDetails = [
      { key: 'No. of Devices', value: selectedGroupDetails.no_of_devices },
      { key: 'Estimated Generation', value: `${selectedGroupDetails.estimated_generation} kWh` },
      { key: 'Actual Generation', value: `${selectedGroupDetails.actual_generation} kWh` },
      { key: 'Total Issuance', value: `${selectedGroupDetails.total_issuance} kWh` },
      { key: 'Future Commitment', value: `${selectedGroupDetails.future_commitment} kWh` },
    ];
  
    doc.addImage(logoBase64, 'JPEG', 10, 10, 30, 30); // Add the logo to the PDF
    doc.setFontSize(18);
    const groupNameWidth = doc.getTextWidth(groupName);
    const pageWidth = doc.internal.pageSize.getWidth();
    const groupNameX = (pageWidth - groupNameWidth) / 2;
    doc.text(groupName, groupNameX, 40); // Center the groupName text and position it slightly lower than the logo
    doc.autoTable({
      startY: 50, // Adjust the starting position of the table
      body: groupDetails.map((detail) => [detail.key, detail.value]),
    });
    doc.save(`${groupName}.pdf`);
  };

useEffect(() => {
  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0].Group); // Set the selected group to the first group in the list
        fetchGroupDetails(data[0].Group); // Fetch the details for the selected group
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };
  fetchGroups();
}, []);
  
  const fetchGroupDetails = async (groupName) => {
    setLoading(true);

    try {
      const response = await fetch('/api/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ group: groupName }),
      });
      const data = await response.json();
      setSelectedGroupDetails(data[0]);
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
    finally {
      setLoading(false);
    }
  };
  
  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
    fetchGroupDetails(event.target.value);
  };

  return (
    <div className="main-content" style={{ marginLeft: '400px', padding: '1rem' }}>
      <div className="min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-800 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <h1 className="text-2xl font-semibold text-center mb-6">Select a Group</h1>
            <div className="w-full">
              <select
                value={selectedGroup}
                onChange={handleGroupChange}
                className="w-full p-2 mb-6 text-center text-gray-600 text-sm bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-800"
              >
                {groups.map((group) => (
                  <option key={group.Group} value={group.Group}>
                    {group.Group}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <Transition
                show={loading}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-800"></div>
                  <p className="ml-4 text-sky-800 font-semibold">Loading...</p>
                </div>
              </Transition>
            ) : (
              selectedGroupDetails && (
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
              )
            )}
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="mt-10 bg-sky-800 text-white px-4 py-2 rounded-md "
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default Groups;