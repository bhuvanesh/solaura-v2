"use client"
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/invoice');
        const data = await res.json();
        setInvoices(data);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    fetchData();
  }, []);

  const handleInvoiceClick = (invoice) => {
    // Perform the necessary transformations on your invoice object
    const transformedData = {
      invoiceid: invoice.invoiceid,
      groupName: invoice.groupName,
      capacity: invoice.capacity,
      regNo: invoice.regNo.toString(),
      regdevice: invoice.regdevice,
      issued: invoice.issued,
      ISP: invoice.ISP.toString(),
      registrationFee: invoice.registrationFee.toString(),
      issuanceFee: invoice.issuanceFee,
      USDExchange: invoice.USDExchange,
      EURExchange: invoice.EURExchange,
      invoicePeriodFrom: new Date(invoice.invoicePeriodFrom).toLocaleDateString('en-GB').split('/').reverse().join('-'), // Converts to "DD-MM-YYYY"
      invoicePeriodTo: new Date(invoice.invoicePeriodTo).toLocaleDateString('en-GB').split('/').reverse().join('-'), // Converts to "DD-MM-YYYY"
      gross: invoice.gross,
      regFeeINR: invoice.regFeeINR.toString(),
      issuanceINR: invoice.issuanceINR,
      netRevenue: invoice.netRevenue,
      successFee: invoice.successFee,
      finalRevenue: invoice.finalRevenue,
      project: invoice.project,
      netRate: invoice.netRate,
      pan: invoice.pan,
      gst: invoice.gst,
      address: invoice.address,
      date: new Date(invoice.date).toLocaleDateString('en-GB').split('/').reverse().join('-'),
      deviceIds: invoice.deviceIds,
      // Assuming companyName is part of the transformed structure according to your initial example
      companyName: invoice.companyName,
      // Convert specific structure into stringified JSON for formData
      formData: JSON.stringify({
        groupName: invoice.groupName,
        companyName: invoice.companyName,
        // Assuming you might need these fields similar to your example structure
        year: new Date(invoice.invoicePeriodFrom).getFullYear().toString(),
        invoicePeriodFrom: new Date(invoice.invoicePeriodFrom).toLocaleDateString('en-GB'),
        invoicePeriodTo: new Date(invoice.invoicePeriodTo).toLocaleDateString('en-GB'),
        // Add or modify fields as necessary
      }),
      responseData: JSON.stringify([{
        "Device ID": invoice.deviceIds,
        "Project": invoice.project,
        "Capacity": invoice.capacity,
        "TotalIssued": invoice.issued,
      }])
    };

    // Serialize transformedData for URL
    const queryParams = new URLSearchParams(transformedData).toString();

    router.push(`/dash/invoice/print/pdfpreview?${queryParams}`);
};


  return (
    <div className="invoices-container" style={{ maxWidth: '50%' }}>
      <h1 className="text-4xl font-bold text-center text-gray-900">Invoices</h1>
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Invoice Period From</TableHead>
              <TableHead>Invoice Period To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell style={{ cursor: 'pointer' }} onClick={() => handleInvoiceClick(invoice)}>
                  {invoice.invoiceid}
                </TableCell>
                <TableCell>{invoice.companyName}</TableCell>
                <TableCell>{new Date(invoice.invoicePeriodFrom).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(invoice.invoicePeriodTo).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Invoices;