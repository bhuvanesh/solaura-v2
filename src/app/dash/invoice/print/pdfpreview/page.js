"use client"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from '@mui/material/Button';
import { MdFileDownload } from 'react-icons/md';
import { useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import html2canvas from "html2canvas";
import { useRouter } from 'next/navigation';
import convertToWords from "@/components/convertToWords";
import ExcelModifier from "@/components/invoice";
import { useState } from "react";

export default function Invoicepdf(args) {
  
  const data = args.searchParams;
  const formDataObj = JSON.parse(data.formData);
  console.log(args);
  const router = useRouter();
  const [showExcelModifier, setShowExcelModifier] = useState(false);
  
  const calcValue = parseFloat((data.issued * data.netRate).toFixed(4));
  const calcValueWithRate = parseFloat((calcValue * 0.09).toFixed(4));

  // Helper function to format numbers using Intl.NumberFormat
  function formatNumber(value) {
    return new Intl.NumberFormat('en-IN').format(value);
  }

const IssuanceData = async () => {
  const response = await fetch('/api/invoiceworksheet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ deviceIds: data.deviceIds ,invoicePeriodFrom:data.invoicePeriodFrom,invoicePeriodTo:data.invoicePeriodTo}),
  });
  const IssuanceData = await response.json();
  console.log(IssuanceData);
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add title
  const title = `${data.groupName || "N/A"} (${data.invoicePeriodFrom || ""} to ${data.invoicePeriodTo || ""})`;
  doc.setFontSize(18);
  const titleWidth = doc.getTextWidth(title);
  const titleX = (pageWidth / 2) - (titleWidth / 2);
  doc.text(title, titleX, 22);

  // Add first table
  const firstTableData = [
    ["Company Name", data.companyName],
    ["Capacity (MW)", parseFloat(data.capacity).toFixed(2)],
    ["No of Registration", data.regNo],
    ["Issued (MWh)", parseFloat(data.issued).toFixed(2)],
    ["Indicative Unit Sale Price (USD)", parseFloat(data.ISP).toFixed(2)],
    ["Registration Fee(Euros)", parseFloat(data.registrationFee).toFixed(2)],
    ["Issuance Fee (Euros)", parseFloat(data.issuanceFee).toFixed(2)],
    ["USD to INR Exchange rate", parseFloat(data.USDExchange).toFixed(2)],
    ["EUR to INR Exchange rate", parseFloat(data.EURExchange).toFixed(2)],
    ["Gross Revenue (INR)", parseFloat(data.gross).toFixed(2)],
    ["Registration Fee (INR)", parseFloat(data.regFeeINR).toFixed(2)],
    ["Isuannce Fee (INR)", parseFloat(data.issuanceINR).toFixed(2)],
    ["Net Revenue off Registration and Issuance Fee (INR)", parseFloat(data.netRevenue).toFixed(2)],
    ["Success Fee for Solaura(INR)", parseFloat(data.successFee).toFixed(2)],
    ["Net Revenue Generator(INR)", parseFloat(data.finalRevenue).toFixed(2)],
    ["Net Trade Rate (INR/MWh)", parseFloat(data.netRate).toFixed(2)]
  ];

  doc.autoTable({
    startY: 30,
    body: firstTableData,
    theme: 'grid',
    styles: { fontSize: 10 ,font: "helvetica"},
  });

  // Add second table
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const deviceData = {};
  IssuanceData[0].forEach(item => {
    if (!deviceData[item["Device ID"]]) {
      deviceData[item["Device ID"]] = Array(12).fill(0);
    }
    const monthIndex = months.findIndex(m => m.toLowerCase() === item.Month.toLowerCase());
    deviceData[item["Device ID"]][monthIndex] = parseFloat(item.Issued).toFixed(2);
  });

  const secondTableData = Object.entries(deviceData).map(([deviceId, monthlyData]) => {
    const total = monthlyData.reduce((sum, value) => sum + parseFloat(value || 0), 0);
    return [deviceId, ...monthlyData.map(value => parseFloat(value).toFixed(2)), total.toFixed(2)];
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Device ID", ...months, "Total Issued"]],
    body: secondTableData,
    theme: 'grid',
    styles: { fontSize: 5 ,font: "helvetica"},
  });

  doc.save(`${data.groupName || "Invoice"}_data.pdf`);
}
  
  // Format the calculated values
  const formattedCalcValue = formatNumber(calcValue);
  const formattedCalcValueWithRate = formatNumber(calcValueWithRate);
  const totalInvoiceValue = parseFloat((calcValue + 2 * calcValueWithRate).toFixed(2));

  const formattedTotalInvoiceValue = formatNumber(totalInvoiceValue);
  const totalInvoiceValueInWords = convertToWords(totalInvoiceValue);

  return (
    <div className="mx-auto">
        <button
      className="mb-4 mr-4 px-4 py-2 bg-blue-500 text-white rounded"
      onClick={() => router.back()}
    >
      Back
    </button>
    {data.action !== 'preview' && (
      <>
        <button
          className="mb-4 mr-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => IssuanceData()}
        >
          Download Worksheet
        </button>
        <button
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setShowExcelModifier(true)}
        >
          Download Invoice
        </button>
      </>
    )}
    {showExcelModifier && <ExcelModifier data={data} />}
    <div className="m-auto max-w-screen-lg border-2 border-black">
      <div className="grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-3">
          <span className="text-base font-medium">{formDataObj.companyName}</span>
          <span className="text-xs py-1">PAN:{data.pan}</span>
          <span className="text-xs py-1">GST:{data.gst}</span>
          <span className="text-xs py-1">TAN:</span>
        </div>
        <div className="min-h-[50px] flex flex-col-reverse items-center  sm: col-span-6">
          <span className="text-xl font-semibold">DRAFT TAX INVOICE</span>
        </div>
        <div className="min-h-[50px] flex  sm: col-span-3"></div>
      </div>
      <div className="h-[2px] bg-black w-full rounded-lg px-2"></div>
      {/* Info Section -1  */}
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Customer Name</span>
          <span className="text-xs">Solaura Power PVT LTD</span>
        </div>
        <div className="min-h-[50px] flex   sm: col-span-4"></div>
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Invoice Date:{data.date}</span>
          <span className="text-sm font-medium">Invoice Number:{data.invoiceid}</span>
        </div>
      </div>
      {/* Info Section-2 */}
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Billing Address</span>
          <span className="text-xs">
          F1 Plot, 3rd Street, Kuberan Nagar, Extension, Madipakkam, 
          Chennai, Tamil Nadu - 600091
          </span>
        </div>
        <div className="min-h-[50px] flex   sm: col-span-4"></div>
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Beneficiary Address</span>
          <span className="text-xs">
            {data.address}
          </span>
        </div>
      </div>
      {/* Info Section-3 */}
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex  sm: col-span-4">
          <span className="text-sm font-medium">GSTIN:33ABHCS3747D1ZG</span>
        </div>
        <div className="min-h-[50px] flex   sm: col-span-4"></div>
        <div className="min-h-[50px] flex  sm: col-span-4">
          <span className="text-sm font-medium">GST:{data.gst}</span>
        </div>
      </div>
      {/* Info section-4 */}
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
      <div className="min-h-[50px] flex flex-col sm: col-span-4">
    <span className="text-sm font-medium">Project Name</span>
    {data.project &&
        data.project.split(" and ").map((projectName, index) => (
            <span key={index} className="text-xs">{projectName}</span>
        ))
    }
</div>
        <div className="min-h-[50px] flex flex-col  sm: col-span-4">
          <span className="text-sm font-medium">Volume Period</span>
          <span className="text-xs">{data.invoicePeriodFrom} to {data.invoicePeriodTo}</span>
        </div>
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">State: Tamil Nadu</span>
          <span className="text-sm font-medium">State Code:33</span>
        </div>
      </div>
      {/* Info section-5 */}
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Place of Supply: Chennai </span>
          <span className="text-sm font-medium">Name of State:Tamil Nadu </span>
        </div>
        <div className="min-h-[50px] flex   sm: col-span-4"></div>
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">
            Electronic Reference Number:{" "}
          </span>
          <span className="text-sm font-medium">Date: </span>
        </div>
      </div>

      <div className="p-2">
        <Table className=" mt-2 border border-black">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] text-sm font-medium text-black">
                Description of Services
              </TableHead>
              <TableHead className="text-sm font-medium text-black">HSN Code</TableHead>
              <TableHead className="text-sm font-medium text-black">Taxable Value</TableHead>
              <TableHead className="text-right text-sm font-medium text-black">
                <span className="flex justify-center w-full border-b border-black">CGST</span>
                <span className="flex justify-between  w-full">
                  <p className="">Rate</p>
                  <p>Amt.</p>
                </span>
              </TableHead>
              <TableHead className="text-right text-sm font-medium text-black">
                <span className="flex justify-center w-full border-b border-black">SGST</span>
                <span className="flex justify-between  w-full">
                  <p>Rate </p>
                  <p>Amt.</p>
                </span>
              </TableHead>
              <TableHead className="text-right text-sm font-medium text-black">
                <span className="flex justify-center w-full border-b border-black">IGST</span>
                <span className="flex justify-between  w-full">
                  <p>Rate</p>
                  <p>Amt.</p>
                </span>
              </TableHead>
              <TableHead className="text-right text-sm font-medium text-black">
                <span className="flex justify-center w-full border-b border-black">CESS</span>
                <span className="flex justify-between  w-full">
                  <p>Rate</p>
                  <p>Amt.</p>
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-xs">Purchase of renewable attributes for I-REC ({data.issued} units at INR {data.netRate} per unit)</TableCell>
              <TableCell className="text-xs">49070000</TableCell>
              <TableCell className="text-xs">{formattedCalcValue}</TableCell>
              <TableCell className="text-xs">
                <span className="p-1 flex flex-row justify-between">
                  <p>9%</p>
                  <p>{formattedCalcValueWithRate}</p>
                </span>
              </TableCell>
              <TableCell className="text-xs">
                <span className="p-1 flex flex-row justify-between">
                  <p>9%</p>
                  <p>{formattedCalcValueWithRate}</p>
                </span>
              </TableCell>
              <TableCell className="text-xs">
                <span className="p-1 flex flex-row justify-between">
                  <p>18%</p>
                  <p>-</p>
                </span>
              </TableCell>
              <TableCell className="text-xs">
                <span className="p-1 flex flex-row justify-between">
                  <p>-</p>
                  <p>-</p>
                </span>
              </TableCell>
            </TableRow>
            {/* New total row */}
  <TableRow>
    <TableCell className="text-xs font-medium">Total</TableCell>
    <TableCell className="text-xs"></TableCell> {/* Empty cell for alignment */}
    <TableCell className="text-xs">{formattedCalcValue}</TableCell> {/* Empty cell for alignment */}
    <TableCell className="text-xs">
      <span className="p-1 flex flex-row justify-between">
        <p></p> {/* Empty cell for alignment */}
        <p>{formattedCalcValueWithRate}</p>
      </span>
    </TableCell>
    <TableCell className="text-xs">
      <span className="p-1 flex flex-row justify-between">
        <p></p> {/* Empty cell for alignment */}
        <p>{formattedCalcValueWithRate}</p>
      </span>
    </TableCell>
    <TableCell className="text-xs">
      <span className="p-1 flex flex-row justify-between">
        <p></p> {/* Empty cell for alignment */}
        <p>-</p>
      </span>
    </TableCell>
    <TableCell className="text-xs">
      <span className="p-1 flex flex-row justify-between">
        <p></p> {/* Empty cell for alignment */}
        <p>-</p>
      </span>
    </TableCell>
  </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-12">
          <span className="text-sm py-1">
            <span className="font-medium">Total Invoice Value (In Figure):</span> {formattedTotalInvoiceValue}
          </span>
          <span className="text-sm py-1">
            <span className="font-medium">Total Invoice Value (In Words):</span> {totalInvoiceValueInWords}
          </span>
          <span className="text-sm font-medium py-1">
            Amount of Tax Subject to Reverse Charge:
          </span>
          <div className="flex flex-row items-end justify-evenly">
            <span className="text-sm font-normal">CGST: </span>
            <span className="text-sm font-normal">SGST: </span>
            <span className="text-sm font-normal">IGST: </span>
          </div>
        </div>
      </div>
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">
            Bank details for payment through RTGS/NEFT
          </span>
          <span className="text-xs py-1">Beneficiary Name: </span>
          <span className="text-xs py-1">Account: </span>
          <span className="text-xs py-1">IFSC: </span>
          <span className="text-xs py-1">Branch: </span>
        </div>
        <div className="min-h-[50px] flex   sm: col-span-4"></div>
        <div className="min-h-[50px] flex flex-col justify-between sm: col-span-4">
          <span className="text-sm font-medium">Name of the Signatory: </span>
          <span className="text-sm font-medium">Signature </span>
        </div>
      </div>
      <div className="mt-2 grid p-1 sm: grid-cols-12 gap-2 w-full">
        <div className="min-h-[50px] flex flex-col sm: col-span-12">
          <span className="text-sm font-medium">Payment terms and conditions:</span>
          <span className="text-xs px-4">
          <ul className="list-disc">
            <li> Immediate by cheque or wire transfer.</li>
            <li>
  The due date for payment of invoices shall be the date of issue of
  the invoice (&apos;the due date&apos;).
</li>
            <li>
              For payment by cheques, please issue crossed cheque in favour of
              Solaura Power Private Limited.
            </li>
            <li>
              Kindly refer the invoice number behind the cheque in case of
              cheque payment.
            </li>
            <li>
              If the payment is through NEFT/online transfer, please refer the
              invoice number in payment description.
            </li>
          </ul>
          </span>

        </div>
      </div>
      <div className="p-1 w-full"></div>
    </div>
    </div>
  );
}

// export default invoicesm: