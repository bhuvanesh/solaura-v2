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

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);

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

  return (
    <div className="invoices-container" style={{ maxWidth: '50%' }}>
      <h1 className="text-4xl font-bold text-center text-gray-900">Invoices</h1>
      {/* Table scroll wrapper */}
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
                <TableCell>{invoice.invoiceid}</TableCell>
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
