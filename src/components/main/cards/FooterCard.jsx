import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const getMonthBeforePrevMonth = (date) => {
  let newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - 2);
  return newDate.toLocaleString('default', { month: 'long' });
};

const FooterCard = ({ footerData: data, selectedYear }) => {  
  const currentMonth = new Date().getMonth();
  const adjustedYear = currentMonth === 0 ? selectedYear - 1 : selectedYear;
  const adjustedPrevYear = currentMonth === 0 ? selectedYear - 2 : selectedYear - 1;

  const getThreeMonthsAgo = (date) => {
    let newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 3);
    return newDate.toLocaleString('default', { month: 'long' });
  };
  const monthBeforePrevMonth = getMonthBeforePrevMonth(new Date());
  const threeMonthsAgo = getThreeMonthsAgo(new Date());

  return (
    <Card className="text-primarybase hover:bg-slate-50 w-full">
      <div>
        <CardHeader className="">Energy Generation Summary</CardHeader>
      </div>
      <CardContent className="flex justify-between">
        <div className="my-auto w-1/3 px-2">
          <div className="h-4 p-1">
            {`${selectedYear-1}: ${data ? new Intl.NumberFormat('en-IN').format(data.total_actual_previous_year) : ''} MWh`}
          </div>
          <h4 className="p-1">
            {`${selectedYear}: ${data ? new Intl.NumberFormat('en-IN').format(data.total_actual_generation) : ''} MWh`}
          </h4>
          <div className="h-6">
            <span className={data && ((data.total_actual_generation - data.total_actual_previous_year) / data.total_actual_previous_year) * 100 < 0 ? 'text-red-500' : ''}>
              {(data && (Math.floor(((data.total_actual_generation - data.total_actual_previous_year) / data.total_actual_previous_year) * 100)) >= 0) ? "+" : ""}{data && (Math.floor(((data.total_actual_generation - data.total_actual_previous_year) / data.total_actual_previous_year) * 100))}%
            </span>
          </div>
        </div>
  
        <div className="my-auto w-1/3 px-2">
          <div className="h-4 p-1">
            {`${monthBeforePrevMonth} (${adjustedPrevYear}): ${data ? new Intl.NumberFormat('en-IN').format(data.prev_month_actual_generation_previous_year) : ''} MWh`}
          </div>
          <h4 className="p-1">
            {`${monthBeforePrevMonth} (${adjustedYear}): ${data ? new Intl.NumberFormat('en-IN').format(data.prev_month_actual_generation) : ''} MWh`}
          </h4>
          <div className="h-6">
            <span className={data && ((data.prev_month_actual_generation - data.prev_month_actual_generation_previous_year) / data.prev_month_actual_generation_previous_year) * 100 < 0 ? 'text-red-500' : ''}>
              {(data && (Math.floor(((data.prev_month_actual_generation - data.prev_month_actual_generation_previous_year) / data.prev_month_actual_generation_previous_year) * 100)) >= 0) ? "+" : ""}{data && (Math.floor(((data.prev_month_actual_generation - data.prev_month_actual_generation_previous_year) / data.prev_month_actual_generation_previous_year) * 100))}%
            </span>
          </div>
        </div>
  
        <div className="my-auto w-1/3 px-2">
          <div className="h-4 p-1">
            {`${threeMonthsAgo} (${adjustedYear}): ${data ? new Intl.NumberFormat('en-IN').format(data.previous_of_previous_month_actual_generation) : ''} MWh`}
          </div>
          <h4 className="p-1">
            {`${monthBeforePrevMonth} (${adjustedYear}): ${data ? new Intl.NumberFormat('en-IN').format(data.prev_month_actual_generation) : ''} MWh`}
          </h4>
          <div className="h-6">
            <span className={data && ((data.prev_month_actual_generation - data.previous_of_previous_month_actual_generation) / data.previous_of_previous_month_actual_generation) * 100 < 0 ? 'text-red-500' : ''}>
              {(data && (Math.floor(((data.prev_month_actual_generation - data.previous_of_previous_month_actual_generation) / data.previous_of_previous_month_actual_generation) * 100)) >= 0) ? "+" : ""}{data && (Math.floor(((data.prev_month_actual_generation - data.previous_of_previous_month_actual_generation) / data.previous_of_previous_month_actual_generation) * 100))}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FooterCard;