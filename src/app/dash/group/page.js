"use client"
import { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import LoadingButton from '@/components/Loading';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedType, setSelectedType] = useState('Total');
  const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  
  
  
  const handleDownload = async () => {
    setIsDownloading(true);
    const logoUrl = 'https://i.imgur.com/1Tl8SjL.jpg';
    const logoResponse = await fetch(logoUrl);
    const logoBlob = await logoResponse.blob();
    const logoBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(logoBlob);
    });
  
    const types = ['Total', 'Solar', 'Wind'];
  
    const doc = new jsPDF();
    doc.addImage(logoBase64, 'JPEG', 10, 10, 30, 30); // Add the logo to the PDF
    doc.setFontSize(18);
    const pageWidth = doc.internal.pageSize.getWidth();
    const groupNameX = (pageWidth / 2);
    doc.text(selectedGroup, groupNameX, 40); // Center the groupName text and position slightly lower than the logo
  
    let startY = 50;
  
    for (const type of types) {
      try {
        const response = await fetch('/api/group', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ group: selectedGroup }),
        });
        const data = await response.json();
        const groupDetails = data.find(g => g.Type === type); // Find the details for the current type
  
        const tableData = [
          { key: 'No. of Devices', value: groupDetails.no_of_devices },
          { key: 'Estimated Generation', value: `${groupDetails.estimated_generation} kWh` },
          { key: 'Actual Generation', value: `${groupDetails.actual_generation ? groupDetails.actual_generation : 0} kWh` },
          { key: 'Total Issuance', value: `${groupDetails.total_issuance ? groupDetails.total_issuance : 0} kWh` },
          { key: 'Future Commitment', value: `${groupDetails.future_commitment} kWh` },
        ];
  
        doc.setFontSize(16);
        doc.text(`${type}`, 10, startY + 10);
        doc.autoTable({
          startY: startY + 15,
          head: [['Measure', 'Value']],
          body: tableData.map((detail) => [detail.key, detail.value]),
        });
  
        startY = doc.previousAutoTable.finalY + 10;
      } catch (error) {
        console.error(`Error fetching group details for the type ${type}:`, error);
      }
    }
  
    doc.save(`${selectedGroup}.pdf`);
    setIsDownloading(false);

  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const fetchGroupDetails = async (groupName, groupType) => {
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

      // Look for the user-selected type in the returned data
      const selectedData = data.find((group) => group.Type === groupType);

      setSelectedGroupDetails(selectedData);
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
    finally {
      setLoading(false);
    }
};

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
    fetchGroupDetails(event.target.value, selectedType); // Fetch the group details with the selected type too
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
          setSelectedGroup(data[0].Group);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDetails(selectedGroup, selectedType);
    }
  }, [selectedGroup, selectedType]);

  return (
    <div className="main-content" style={{ marginLeft: '400px', padding: '1rem' }}>
      <div className="min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-800 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <h1 className="text-2xl font-semibold text-center mb-6">Select a Group</h1>

            <div className="mb-4">
  <label>
    <input type="radio" value="Total" checked={selectedType === 'Total'} onChange={handleTypeChange} />
    <span className="ml-2">Total</span>
  </label>
  <label className="ml-4">
    <input type="radio" value="Solar" checked={selectedType === 'Solar'} onChange={handleTypeChange} />
    <span className="ml-2">Solar</span>
  </label>
  <label className="ml-4">
    <input type="radio" value="Wind" checked={selectedType === 'Wind'} onChange={handleTypeChange} />
    <span className="ml-2">Wind</span>
  </label>
</div>


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
                      <li>Actual Generation: {selectedGroupDetails.actual_generation ? selectedGroupDetails.actual_generation : 0}KWh</li>
                     <li>Total Issuance: {selectedGroupDetails.total_issuance ? selectedGroupDetails.total_issuance : 0}KWh</li>
                      <li>Future Commitment: {selectedGroupDetails.future_commitment}KWh</li>
                    </ul>
                  </div>
                </Transition>
              )
            )}
          </div>
        </div>
        <LoadingButton
      isLoading={isDownloading}
      onClick={handleDownload}
      loadingLabel="Downloading..."
      style={{ marginTop: '25px' }}
    >
      Download as PDF
    </LoadingButton>
      </div>
    </div>
  );
};

export default Groups;