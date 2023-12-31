"use client"
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


async function fetchData() {
    const response = await fetch('/api/btable');
    const data = await response.json();
    return data;
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Table() {
    const [data, setData] = useState([]);
    const [activeRow, setActiveRow] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State storing the current search term
    const [statusFilter, setStatusFilter] = useState('Active');
    const confirmDelete = (row) => {
      if (window.confirm('Do you really want to delete this?')) {
        handleDelete(row).then(() => {
          window.location.reload(); // Refresh the page after deletion
        });
      }
    };
    const handleDelete = async (row) => {
      const transactionId = row['Transaction ID'];
    
      for (const detail of row.details) {
        const deviceId = detail['Device ID'];
        const monthData = months.reduce((acc, m) => {
          if (detail[m]) {
            acc[m] = detail[m];
          }
          return acc;
        }, {});
    
        const response = await fetch('/api/cancel', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transactionId, deviceId, monthData }),
        });
    
        if (response.ok) {
          // Remove the row from the data state
          setData((prevData) =>
            prevData.filter((item) => item['Transaction ID'] !== transactionId)
          );
        } else {
          console.error('Failed to delete the row');
        }
      }
    };

    useEffect(() => {
        fetchData().then(data => {
            // Group data by Transaction ID
            const groupedData = data.reduce((acc, row) => {
                const key = row['Transaction ID'];
                if (!acc[key]) {
                    acc[key] = {
                        details: [],
                        total: 0,
                        ...row
                    }
                }
                acc[key].details.push(row);
                acc[key].total += months.reduce((sum, m) => sum + (Number.isInteger(row[m]) ? row[m] : 0), 0);
                return acc;
            }, {});

            setData(Object.values(groupedData));
        });
    }, []);

    const filteredData = data.filter((item) => {
      return item['Organisation'].toLowerCase().includes(searchQuery.toLowerCase()) && (statusFilter === 'All' || item['Status'] === 'succeeded');
    });

    const downloadAsPDF = () => {
      const pdf = new jsPDF();
      pdf.setFontSize(18);
      pdf.text('Transaction Data', 14, 22);
      pdf.setFontSize(11);
      pdf.setTextColor(100);
    
      let finalY = 0;
    
      // Filter the data based on the statusFilter
      const dataToDownload = data.filter((item) => statusFilter === 'All' || item['Status'] === 'succeeded');
    
      dataToDownload.forEach((row) => {
        const transactionColumns = [
          { header: 'Transaction ID', dataKey: 'Transaction ID' },
          { header: 'Organisation', dataKey: 'Organisation' },
          { header: 'Status', dataKey: 'Status' },
          { header: 'Total', dataKey: 'total' },
        ];
    
        const transactionData = [{
          'Transaction ID': row['Transaction ID'],
          Organisation: row['Organisation'],
          Status: row['Status'],
          total: row['total'],
        }];
    
        pdf.autoTable(transactionColumns, transactionData, {
          startY: finalY === 0 ? 30 : finalY + 10,
          margin: { horizontal: 14 },
          styles: { overflow: 'linebreak', cellWidth: 'wrap' },
          columnStyles: { text: { cellWidth: 'auto' } },
          didParseCell: function(cell) {
            if (cell.row.index === 0) {
              cell.cell.styles.fontStyle = 'bold';
            }
          }
        });
    
        finalY = pdf.autoTable.previous.finalY;
    
        row.details.forEach((detail) => {
          const deviceColumns = [
            { header: 'Device ID', dataKey: 'Device ID' },
            { header: 'year', dataKey: 'year' },
            ...months.map(month => (
              detail[month] ? { header: month, dataKey: month } : null
            )).filter(Boolean)
          ];
    
          const deviceData = [
            months.reduce((acc, month) => {
              if(detail[month]) {
                acc[month] = detail[month];
              }
              return acc;
            }, {'Device ID': detail['Device ID'], 'year': detail['year']})
          ]
    
          pdf.autoTable(deviceColumns, deviceData, {
            startY: finalY + 10,
            margin: { horizontal: 14 },
            styles: { overflow: 'linebreak', cellWidth: 'wrap' },
            columnStyles: { text: { cellWidth: 'auto' } },
            didParseCell: function(cell) {
              if (cell.section === 'head') {
                cell.cell.styles.fillColor = 255; // White color
                cell.cell.styles.textColor = 0; // Black color
                cell.cell.styles.fontStyle = 'normal'; // No bold
              }
            },
          });
    
          finalY = pdf.autoTable.previous.finalY;
        });
      });
    
      pdf.save('transaction-data.pdf');
    };
  console.log(filteredData);

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 border-2">
          <div className="sm:flex sm:items-start">
            <div className="w-full text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-white text-center bg-sky-800">Transaction List</h3>
              <button
                onClick={downloadAsPDF}
                className="bg-sky-700 hover:bg-sky-900 text-white font-bold py-2 px-4 rounded mt-4"
              >
                Download as PDF
              </button>
            <div>
  <input 
      type="radio"  id="all" name="status" value="All"  checked={statusFilter === 'All'} 
      onChange={(e) => setStatusFilter(e.target.value)}  />
  <label htmlFor="all">All</label>
<input 
      type="radio"  id="active"  name="status" value="Active" className="ml-4" checked={statusFilter === 'Active'} 
      onChange={(e) => setStatusFilter(e.target.value)}  />
  <label htmlFor="active">Active</label>
</div>
              <div className="mt-2">
                <div className='py-2'>
                <input
                  type="text"
                  placeholder="Search organisation"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='border rounded-md p-2 border-sky-800'
                /></div>
                <div className="grid grid-cols-1 gap-2">
                  <table className="table-auto w-full divide-y divide-gray-200 border-1">
                    <thead className="bg-sky-800 text-white rounded-md">
                      <tr>
                        <th className="px-4 py-2 text-xs font-medium  uppercase tracking-wider">Transaction ID</th>
                        <th className="px-4 py-2 text-xs font-medium  uppercase tracking-wider">Organisation</th>
                        <th className="px-4 py-2 text-xs font-medium  uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-xs font-medium  uppercase tracking-wider">Requirement</th>
                        <th className="px-4 py-2 text-xs font-medium  uppercase tracking-wider">revoke order</th>

                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-left">
                    {filteredData.map((row, i) => (                        <React.Fragment key={i}>
                          <tr onClick={() => activeRow === i ? setActiveRow(null) : setActiveRow(i)} className="hover:bg-gray-100 cursor-pointer">
                            <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">{row['Transaction ID']}</td>
                            <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">{row['Organisation']}</td>
                            <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">{row['Status']}</td>
                            <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">{row['total']}</td>
                            <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">
                            <td className="px-4 py-2 whitespace-normal text-sm text-gray-500">
    {row['Status'] !== 'Revoked' && (
      <button onClick={() => confirmDelete(row)} className='bg-red-200 rounded-md text-black p-1 hover:bg-red-300'>Revoke Txn</button>
    )}
  </td>
</td>
                          </tr>
                          {activeRow === i &&
                            <tr>
                              <td colSpan="5" className="px-4 py-4">
                                {row.details.map((detail, i) => (
                                  <div key={i}>
                                    <p className="font-semibold text-sm">Device ID: {detail['Device ID']}</p>
                                    <p className="font-semibold text-sm">year: {detail['year']}</p>
                                    {months.map(
                                      (month, j) =>
                                        detail[month] &&
                                        <p key={j} className="text-sm px-4">
                                          {`${month}: ${detail[month]}`}
                                        </p>
                                    )}
                                  </div>
                                ))}
                              </td>
                            </tr>
                          }
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}