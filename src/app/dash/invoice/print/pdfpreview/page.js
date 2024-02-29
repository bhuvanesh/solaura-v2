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
import html2canvas from "html2canvas";

export default function Invoicepdf(args) {
  
  const data = args.searchParams;
  const formDataObj = JSON.parse(data.formData);
  console.log(args);



  





  const calcValue = parseFloat((data.issued * data.netRate).toFixed(4));
  const calcValueWithRate = parseFloat((calcValue * 0.09).toFixed(4));

  // Helper function to format numbers using Intl.NumberFormat
  function formatNumber(value) {
    return new Intl.NumberFormat('en-IN').format(value);
  }

  // Format the calculated values
  const formattedCalcValue = formatNumber(calcValue);
  const formattedCalcValueWithRate = formatNumber(calcValueWithRate);
  const totalInvoiceValue = parseFloat((calcValue + 2 * calcValueWithRate).toFixed(4));

  const formattedTotalInvoiceValue = formatNumber(totalInvoiceValue);

  const handleDownload = async () => {
    const inputArea = document.body; 
  
    html2canvas(inputArea, { scale: 2, scrollY: -window.scrollY }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
  
      const pdf = new jsPDF('p', 'pt', 'a4'); // Set PDF to A4 size
  
      // Define Crop from the Left Side - adjust 'cropLeft' as necessary
      const cropLeft = 510; // how much to crop from the left side
      const contentWidth = canvas.width - cropLeft; // adjusted content width after cropping
  
      // Calculate the scale to fit the content in A4 size
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const scaleX = pdfWidth / contentWidth;
      const scaleY = pdfHeight / (canvas.height * scaleX / (scaleX * imgProps.width / imgProps.height));
      const scale = Math.min(scaleX, scaleY);
  
      // Calculate dimensions to maintain aspect ratio
      const scaledWidth = imgProps.width * scale;
      const scaledHeight = imgProps.height * scale;
  
      // Adjust canvas dimensions to fit A4, keeping the aspect ratio
      // and adjust x position to crop from the left
      pdf.addImage(imgData, 'PNG', -cropLeft * scale, 0, scaledWidth, scaledHeight);
  
      pdf.save("download-a4.pdf");
    });
  }



  return (
    <div className="mx-auto">
             <Button
      variant="contained"
      color="primary"
      startIcon={<MdFileDownload />}
      onClick={handleDownload}
      className="hidden"
    >
      Download
    </Button>
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
            Plot No 104, 2nd Cross Street, VGP Sea View Part - 1, Palavakkam,
            Chennai - 600 041
          </span>
        </div>
        <div className="min-h-[50px] flex   sm: col-span-4"></div>
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium">Beneficiary Address</span>
          <span className="text-xs">
            636, VIVAAGA BUILDING, OPPANAKARA STREET, COIMBATORE, Coimbatore,
            Tamil Nadu, 641001
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
        <div className="min-h-[50px] flex flex-col sm: col-span-4">
          <span className="text-sm font-medium py-1">
            Total Invoice Value (In Figure):{formattedTotalInvoiceValue}
          </span>
          <span className="text-sm font-medium py-1">
            Total Invoice Value (In Words):
          </span>
          <span className="text-sm font-medium py-1">
            Amount of Tax Subject to Reverse Charge:
          </span>
        </div>
        {/* <div className="min-h-[50px] flex   sm: col-span-4"></div> */}
        <div className="min-h-[50px] flex flex-row items-end justify-evenly sm: col-span-8">
          <span className="text-sm font-normal">CGST: </span>
          <span className="text-sm font-normal">SGST: </span>
          <span className="text-sm font-normal">IGST: </span>
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
        {/* <div className="min-h-[50px] flex   sm: col-span-4"></div> */}
        {/* <div className="min-h-[50px] flex  sm: col-span-4"></div> */}
      </div>
      <div className="p-1 w-full"></div>
    </div>
    </div>
  );
}

// export default invoicesm: