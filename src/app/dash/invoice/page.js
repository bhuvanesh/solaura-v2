"use client"
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import LoadingButton from '@/components/Loading';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import Invoices from '@/components/invoicelist';
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2021 }, (_, i) => 2022 + i);
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const schema = z.object({
  groupName: z.string().refine(value => value !== '', {
    message: 'Group name is required',
  }),
  companyName: z.string().refine(value => value !== '', {
    message: 'Company name is required',
  }),
  year: z.string(),
  invoicePeriodFrom: z.string(),
  invoicePeriodTo: z.string(),
  unitSalePrice: z.number(),
  successFee: z.number(),
  usdExchangeRate: z.number(), 
  eurExchangeRate: z.number(),
});
export default function InvoiceForm() {
const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
resolver: zodResolver(schema)
});
const router = useRouter();
const [apiData, setApiData] = useState([]);
const [filteredCompanies, setFilteredCompanies] = useState([]);
const [selectedGroup, setSelectedGroup] = useState('');
const [selectedCompany, setSelectedCompany] = useState('');
const [selectedInvoicePeriodFrom, setSelectedInvoicePeriodFrom] = useState('');
const [usdExchangeRate, setUsdExchangeRate] = useState(null);
const [eurExchangeRate, setEurExchangeRate] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const onSubmit = data => {
  setIsLoading(true);
   console.log('Submitting:', data);
 
   // Find the selected company's details
   const selectedCompanyDetails = apiData.find(item => item.seller === selectedCompany);
   if (!selectedCompanyDetails) {
    window.alert('Please Select a valid company name');
       return;
   }

   const { pan, gst, address } = selectedCompanyDetails;
   fetch('invoice/inv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...data, pan }), 
  })
  .then(response => response.json())
  .then(responseData => {
    // Check if responseData is null or empty
    if (!responseData || Object.keys(responseData).length === 0) {
      window.alert('Invoice details not Found');
      return;
    }
  
    console.log('Success:', responseData);
    preprocess(data, responseData, pan, gst, address);  // Include PAN, GST, and address here
  })
  .catch((error) => {
    setIsLoading(false);
    console.error('Error:', error);
  });

 };
 const formatDate = (month, year, isEndOfMonth) => {
   const monthIndex = months.indexOf(month);
   const day = isEndOfMonth ? new Date(year, monthIndex + 1, 0).getDate() : '01';
   return `${day}-${monthIndex < 9 ? `0${monthIndex + 1}` : monthIndex + 1}-${year}`;
};

const formatInvoicePeriodFrom = (month, year) => formatDate(month, year, false);
const formatInvoicePeriodTo = (month, year) => formatDate(month, year, true);
const formatProjectNames = (responseData) => {
   const projects = new Set(responseData.map(item => item.Project));
   return Array.from(projects).join(' and ');
};
useEffect(() => {
  fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_KwIbDzv5cNwTsNscUp4Jan2Q5OkTcDOxvUW70qEB&currencies=INR&base_currency=EUR`)
    .then(response => response.json())
    .then(data => setValue('eurExchangeRate', parseFloat(data.data.INR).toFixed(4))); 

  fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_KwIbDzv5cNwTsNscUp4Jan2Q5OkTcDOxvUW70qEB&currencies=INR`)
    .then(response => response.json())
    .then(data => setValue('usdExchangeRate', parseFloat(data.data.INR).toFixed(4))); 
}, []);
 const preprocess = async (formData, responseData, pan, gst, address) => {

   console.log('PAN:', pan);
   console.log('GST:', gst);
   console.log('Address:', address);
   console.log('responsed data',formData)
   const formattedInvoicePeriodFrom = formatInvoicePeriodFrom(formData.invoicePeriodFrom, formData.year);
   const formattedInvoicePeriodTo = formatInvoicePeriodTo(formData.invoicePeriodTo, formData.year);
   const projectNames = formatProjectNames(responseData);

  const deviceIds = responseData.map(item => item['Device ID']).join(',');

  const deviceResponse = await fetch('invoice/invoicereg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceIds }),
  });

  const deviceData = await deviceResponse.json();

  // Log the response
  console.log('Device Data:', deviceData);
  let noDevices = [];
  if (deviceData.no !== "") {
    noDevices = deviceData.no.split(',');
  }
  
  // Extract capacities of 'noDevices' from 'responseData'
  const noDeviceCapacities = responseData
    .filter(device => noDevices.includes(device['Device ID']))
    .map(device => parseFloat(device.Capacity));
  
  // Calculate the registration fee based on the specified conditions
  const registrationFee = noDeviceCapacities.reduce((acc, capacity) => {
    if (capacity >= 3) {
      return acc + 1000;
    } else if (capacity > 1 && capacity < 3) {
      return acc + 500;
    } else if (capacity > 0.25 && capacity <= 1) {
      return acc + 100;
    } else {  // Assuming capacity lesser than or equal to 0.25
      return acc + 100;
    }
  }, 0);


   const capacity = responseData.reduce((acc, device) => acc + parseFloat(device.Capacity), 0);
   const regNo = responseData.length;
   const issued = responseData.reduce((acc, device) => acc + parseFloat(device.TotalIssued), 0);
   const ISP = formData.unitSalePrice;
   const issuanceFee = parseFloat((0.025 * issued).toFixed(4));
   const USDExchange = formData.usdExchangeRate;
   const EURExchange = formData.eurExchangeRate;
   const gross = parseFloat((issued * ISP * USDExchange).toFixed(4));
   const regFeeINR = parseFloat((registrationFee * EURExchange).toFixed(4));
   const issuanceINR = parseFloat((issuanceFee * EURExchange).toFixed(4));
   const netRevenue = parseFloat((gross - (regFeeINR + issuanceINR)).toFixed(4));
   const successFee = parseFloat((formData.successFee * 0.01 * netRevenue).toFixed(4));
   const finalRevenue = parseFloat((netRevenue - successFee).toFixed(4));
   const netRate = parseFloat((finalRevenue / issued).toFixed(4));
   const invoiceid = nanoid(12);
   const formatDate = (date) => {
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const today = new Date();
  const formattedDate = formatDate(today);

 
   const processedData = {
     invoiceid,
     groupName: formData.groupName,
     capacity,
     regNo,
     regdevice:deviceData.no,
     issued,
     ISP,
     registrationFee,
     issuanceFee,
     USDExchange,
     EURExchange,
     invoicePeriodFrom: formattedInvoicePeriodFrom,
     invoicePeriodTo: formattedInvoicePeriodTo,
     gross,
     regFeeINR,
     issuanceINR,
     netRevenue,
     successFee,
     finalRevenue,
     project: projectNames,
     netRate,
     pan,
     gst,
     address,
     date: formattedDate,
     deviceIds,
     formData,
     responseData,
    };
 
   console.log('Processed Data:', processedData);
   const processedDataParam = encodeURIComponent(JSON.stringify(processedData));
   router.push(`/dash/invoice/print?data=${processedDataParam}`);


 };



useEffect(() => {
fetch('invoice/seller')
.then(response => response.json())
.then(data => {
const parsedData = data.map(item => ({
...item,
indicative_price: item.indicative_price ? parseFloat(item.indicative_price) : null,
success_fee: item.success_fee ? parseFloat(item.success_fee) : null,
}));
setApiData(parsedData);
console.log(parsedData)
})
.catch(error => console.error('Error:', error));
}, []);
useEffect(() => {
   setValue('groupName', selectedGroup);
}, [selectedGroup, setValue]);

useEffect(() => {
   setValue('companyName', selectedCompany);
}, [selectedCompany, setValue]);

const uniqueGroups = Array.from(new Set(apiData.map(item => item.group)));

useEffect(() => {
    setFilteredCompanies(apiData.filter(item => item.group === selectedGroup));
  }, [selectedGroup, apiData]);
useEffect(() => {
const company = apiData.find(item => item.seller === selectedCompany);
if (company) {
setValue('unitSalePrice', company.indicative_price);
setValue('successFee', company.success_fee);
} else {
// Reset values when no company is selected
setValue('unitSalePrice', '');
setValue('successFee', '');
}
}, [selectedCompany, apiData, setValue]);
useEffect(() => {
if (selectedGroup) {
setValue('unitSalePrice', '');
setValue('successFee', '');
}
}, [selectedGroup, setValue]);
console.log(errors);
return (
<div className="page-layout" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5" style={{flex: 1}}>   <div>
      <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">Group Name</label>
      <Controller
          name="groupName"
          control={control}
          render={({ field }) => (
            <select {...field} onChange={(e) => setSelectedGroup(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Select a Group</option>
              {uniqueGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          )}
        />
    {errors.groupName && <p className="text-red-500 text-xs mt-2">{errors.groupName.message}</p>}    
   </div>
   <div>
      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
      <Controller
      name="companyName"
      control={control}
      render={({ field }) => (
      <select {...field} onChange={(e) => setSelectedCompany(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
      <option value="">Select a Company</option>
      {filteredCompanies.map(item => (
      <option key={item.id} value={item.seller}>{item.seller}</option>
      ))}
      </select>
      )}
      />
      {errors.companyName && <p className="text-red-500 text-xs mt-2">{errors.companyName.message}</p>}
   </div>
   <div>
      <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
      <Controller
      name="year"
      control={control}
      render={({ field }) => (
      <select {...field} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
         <option value="">Choose the year</option>
         {years.map(year => (
         <option key={year} value={Number(year)}>{year}</option>
         // Change made here
         ))}
      </select>
      )}
      />
    {errors.year && <p className="text-red-500 text-xs mt-2">{errors.year.message}</p>}
   </div>
   <div>
      <label htmlFor="invoicePeriodFrom" className="block text-sm font-medium text-gray-700">Invoice Period From</label>
      <Controller
  name="invoicePeriodFrom"
  control={control}
  render={({ field }) => (
    <select {...field} onChange={(e) => { setSelectedInvoicePeriodFrom(e.target.value); field.onChange(e); }} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
      <option value="">Choose the month</option>
      {months.map(month => (
        <option key={month} value={month}>{month}</option>
      ))}
    </select>
  )}
/>
      {errors.invoicePeriodFrom && <p className="text-red-500 text-xs mt-2">{errors.invoicePeriodFrom.message}</p>}
   </div>
   <div>
      <label htmlFor="invoicePeriodTo" className="block text-sm font-medium text-gray-700">Invoice Period To</label>
      <Controller
  name="invoicePeriodTo"
  control={control}
  render={({ field }) => (
    <select {...field} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
      <option value="">Choose the month</option>
      {months.slice(months.indexOf(selectedInvoicePeriodFrom)).map(month => (
        <option key={month} value={month}>{month}</option>
      ))}
    </select>
  )}
/>
      {errors.invoicePeriodTo && <p className="text-red-500 text-xs mt-2">{errors.invoicePeriodTo.message}</p>}
   </div>
   <div>
      <label htmlFor="unitSalePrice" className="block text-sm font-medium text-gray-700">Indicative Unit Sale Price (USD)</label>
      <input 
      type="number" 
      step="0.01" 
      {...register("unitSalePrice", {
      setValueAs: value => value === "" ? null : parseFloat(value)
      })} 
      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
      />
      {errors.unitSalePrice && <p className="text-red-500 text-xs mt-2">{errors.unitSalePrice.message}</p>}
   </div>
   <div>
      <label htmlFor="successFee" className="block text-sm font-medium text-gray-700">Success Fee in %</label>
      <input 
      type="number" 
      step="0.01" 
      {...register("successFee", {
      setValueAs: value => value === "" ? null : parseFloat(value)
      })} 
      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
      />
     {errors.successFee && <p className="text-red-500 text-xs mt-2">{errors.successFee.message}</p>} 
   </div>
   <div>
  <label htmlFor="usdExchangeRate" className="block text-sm font-medium text-gray-700">USD Exchange Rate</label>
  <input type="number" step="0.0001" {...register("usdExchangeRate", { setValueAs: value => value === "" ? null : parseFloat(value) })} value={usdExchangeRate} onChange={(e) => setUsdExchangeRate(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
  {errors.usdExchangeRate && <p className="text-red-500 text-xs mt-2">{errors.usdExchangeRate.message}</p>}
</div>
<div>
  <label htmlFor="eurExchangeRate" className="block text-sm font-medium text-gray-700">EUR Exchange Rate</label>
  <input type="number" step="0.0001" {...register("eurExchangeRate", { setValueAs: value => value === "" ? null : parseFloat(value) })} value={eurExchangeRate} onChange={(e) => setEurExchangeRate(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
{errors.eurExchangeRate && <p className="text-red-500 text-xs mt-2">{errors.eurExchangeRate.message}</p>}
</div>
<LoadingButton
  type="submit"
  isLoading={isLoading}
  loadingLabel="Generating Invoice..."
  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
>
  Generate Invoice
</LoadingButton>
</form>
 <Invoices />
 </div>
);
}