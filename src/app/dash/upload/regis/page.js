"use client"
import { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingButton from '@/components/Loading';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  groupName: z.string().min(1, { message: "Group name is required." }),
  companyName: z.string().min(1, { message: "Company name is required." }),
  projectName: z.string().min(1, { message: "Project name is required." }),
  capacity: z.preprocess(
    (value) => parseFloat(value),
    z.number().min(0, { message: "Capacity must be a positive number." })
  ),
    deviceId: z.string().min(1, { message: "Device ID is required." }),
  year: z.string().min(1, { message: "Year is required." }),
  cod: z.string().min(1, { message: "CoD is required." }),
  deviceType: z.string().min(1, { message: "Device type is required." }),
  months: z.preprocess(
    (value) => (value).map((item) => parseFloat(item)),
    z.array(z.number().min(0, { message: "Month value must be a positive number." }))
  ),
   registered: z.string().min(1, { message: "Registered status is required." }),
  pan: z.string().min(1, { message: "PAN is required." }),
  gst: z.string().min(1, { message: "GST is required." }),
});

const FormPage = () => {
  const generatePastTenYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({length: 11}, (_, i) => currentYear - i);
  };
  const [data, setData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch data on component mount
    useEffect(() => {
      const fetchData = async () => {
        const response = await fetch('/dash/upload/regis/datafill');
        const result = await response.json();
        setData(result);
      };
  
      fetchData();
    }, []);
  


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupName: '',
      companyName: '',
      projectName: '',
      capacity: 0,
      deviceId: '',
      year: '',
      cod: '',
      deviceType: '',
      months: Array(12).fill(0),
      registered: '',
      pan: '',
      gst: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const modifiedData = data.months.reduce((acc, monthValue, index) => {
      const monthName = new Date(2023, index).toLocaleString('default', { month: 'long' });
      acc.push({
        groupName: data.groupName,
        companyName: data.companyName,
        projectName: data.projectName,
        capacity: parseFloat(data.capacity),
        'Device Id': data.deviceId,
        year: data.year,
        CoD: data.cod,
        Type: data.deviceType,
        registered: data.registered,
        month: monthName.toLowerCase(),
        Estimated: parseInt(monthValue, 10),
        pan: data.pan,
        gst: data.gst,
      });
      return acc;
    }, []);

    const response = await fetch('/api/regis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modifiedData),
    });
  
    const result = await response.json();
  
    if (response.ok) {
      toast.success(result.message || 'Data submitted successfully!');
      setIsSubmitting(false);
      window.location.reload();
    } else {
      toast.error(result.message || 'An error occurred while submitting the data.');
      setIsSubmitting(false);
    }
  };
    // Update form values when the selected company changes
    useEffect(() => {
      if (selectedCompany) {
        const companyData = data.find(company => company.company === selectedCompany);
        if (companyData) {
          form.setValue('pan', companyData.PAN);
          form.setValue('gst', companyData.GST);
        }
      }
    }, [selectedCompany, data, form]);
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 bg-gray-100 rounded-t-lg">
            <h1 className="text-2xl font-bold mb-4">Register device</h1>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-wrap -mx-2">
                  <div className="w-1/2 px-2">
                  <FormField
  control={form.control}
  name="groupName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Group Name</FormLabel>
      <FormControl>
        <select
          {...field}
          onChange={(e) => {
            setSelectedGroup(e.target.value);
            form.setValue('groupName', e.target.value); // Update form value for groupName
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">Select group</option>
          {Array.from(new Set(data.map(item => item.Group))).map(group => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
      </div>
      <div className="w-1/2 px-2">
      <FormField
  control={form.control}
  name="companyName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Company Name</FormLabel>
      <FormControl>
        <select
          {...field}
          onChange={(e) => {
            setSelectedCompany(e.target.value);
            form.setValue('companyName', e.target.value); // Update form value for companyName
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">Select company</option>
          {data.filter(item => item.Group === selectedGroup).map(company => (
            <option key={company.company} value={company.company}>
              {company.company}
            </option>
          ))}
        </select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
                  </div>
                </div>
  
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (MW)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <FormField
                  control={form.control}
                  name="deviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <div className="flex flex-wrap -mx-2">
                  <div className="w-1/2 px-2">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <select {...field} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                              <option value="">Select year</option>
                              {generatePastTenYears().map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-1/2 px-2">
                    <FormField
                      control={form.control}
                      name="cod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CoD</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
  
                <FormField
                  control={form.control}
                  name="deviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Type</FormLabel>
                      <FormControl>
                        <select {...field} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                          <option value="">Select device type</option>
                          <option value="Wind">Wind</option>
                          <option value="Solar">Solar</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <div>
                  <h2 className="text-lg font-bold mb-2">Estimated</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {form.watch("months").map((monthValue, index) => (
                      <FormField
                        key={index}
                        control={form.control}
                        name={`months.${index}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {new Date(2023, index).toLocaleString('default', { month: 'long' })}-(kWh)
                            </FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
  
                <FormField
                  control={form.control}
                  name="registered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registered</FormLabel>
                      <FormControl>
                        <select {...field} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                          <option value="">Select status</option>
                          <option value="Registered">Registered</option>
                          <option value="Pending">Pending</option>
                          <option value="Pipeline">Pipeline</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <div className="flex flex-wrap -mx-2">
                  <div className="w-1/2 px-2">
                    <FormField
                      control={form.control}
                      name="pan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PAN</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-1/2 px-2">
                    <FormField
                      control={form.control}
                      name="gst"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
  
                <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingLabel="Submitting..."
            >
              Submit
            </LoadingButton>
            </form>
            </Form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default FormPage;