"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Function to get previous month
const getPreviousMonth = (date) => {
  let newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - 1);
  return newDate.toLocaleString('default', { month: 'long' });
};

// Function to get month before previous month
const getMonthBeforePrevMonth = (date) => {
  let newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - 2);
  return newDate.toLocaleString('default', { month: 'long' });
};

const FooterCard = (Icon) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/dash/footer')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setData(data[0]);
      })
      .catch((error) => console.error(`Error: ${error}`));
  }, []);

  const year = new Date().getFullYear();
  const previousMonth = getPreviousMonth(new Date());
  const monthBeforePrevMonth = getMonthBeforePrevMonth(new Date());
  return (
    <Card className="text-primarybase hover:bg-slate-50 w-full">
      <div>
        <CardHeader className="">Energy Generation Summary</CardHeader>
      </div>
      <CardContent className="flex justify-between">

        <div className="my-auto w-1/3 px-2">
          <div className="h-4 p-1">{`${year-1}: ${data ? data.total_actual_previous_year : ''} MWh`}</div>
          <h4 className="p-1">{`${year}: ${data ? data.total_actual_generation : ''} MWh`}</h4>
          <div className="h-6">
            +{data && (Math.floor(((data.total_actual_generation - data.total_actual_previous_year) / data.total_actual_previous_year) * 100))}%
          </div>
        </div>

        <div className="my-auto w-1/3 px-2">
          <div className="h-4 p-1">{`${previousMonth} (${year-1}): ${data ? data.prev_month_actual_generation_previous_year : ''} MWh`}</div>
          <h4 className="p-1">{`${previousMonth} (${year}): ${data ? data.prev_month_actual_generation : ''} MWh`}</h4>
          <div className="h-6">
            +{data && (Math.floor(((data.prev_month_actual_generation - data.prev_month_actual_generation_previous_year) / data.prev_month_actual_generation) * 100))}%
          </div>
      </div>

      <div className="my-auto w-1/3 px-2">
          <div className="h-4 p-1">{`${monthBeforePrevMonth} (${year}): ${data ? data.previous_of_previous_month_actual_generation : ''} MWh`}</div>
          <h4 className="p-1">{`${previousMonth} (${year}): ${data ? data.prev_month_actual_generation : ''} MWh`}</h4>
          <div className="h-6">
            +{data && (Math.floor(((data.prev_month_actual_generation - data.previous_of_previous_month_actual_generation) / data.prev_month_actual_generation) * 100))}%
          </div>
      </div>

      </CardContent>
    </Card>
  );
};

export default FooterCard;