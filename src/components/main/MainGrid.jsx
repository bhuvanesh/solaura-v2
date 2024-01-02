"use client"
import React, { useState, useEffect } from "react";
import InfoCard from "./cards/InfoCard";
import {
  ChartBarSquareIcon,
  LightBulbIcon,
  CircleStackIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import EstAct from "./charts/EstAct";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InfoCard2 from "./cards/InfoCard2";
import SellerList from "./rankCards/SellerList";
import EstUse from "./charts/EstUse";
import BuyerList from "./rankCards/BuyerList";

//import { prisma } from "@/lib/prisma";
import FooterCard from "./cards/FooterCard";
import Type from "./charts/type";
export const revalidate=120;

const MainGrid = () => {
  let currYear = new Date().getFullYear();
  const [cardData, setCardData] = useState({});
  const [estActMonthData, setEstActMonthData] = useState({});
  const [estUseMonthData, setEstUseMonthData] = useState({});
  const [typeData, setTypeData] = useState({});
  const [footerData, setFooterData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(currYear);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year: selectedYear })
        };
  
        const cardResponse = await fetch("/api/dash/cards", requestOptions);
        const cardData = await cardResponse.json();
        setCardData(cardData);
  
        const graphResponse = await fetch("/api/dash/graph", requestOptions);
        const graphData = await graphResponse.json();
        setEstUseMonthData({ monthData: graphData.monthData.map((item) => ({ month: item.month, Usage: item.usage, Estimate: item.estimate })) });
        setEstActMonthData({ monthData: graphData.monthData.map((item) => ({ month: item.month, Actual: item.actual, Estimate: item.estimate })) });
        setTypeData({ 
          monthData: graphData.monthData.map((item) => ({ 
            month: item.month, 
            solarEstimate: item.solarEstimate, 
            windEstimate: item.windEstimate, 
            solarUsage: item.solarUsage, 
            windUsage: item.windUsage 
          })) 
        });
  
        const footerResponse = await fetch("/api/dash/footer", requestOptions);
        const footerData = await footerResponse.json();
        setFooterData(footerData[0]);
      } catch (error) {
        console.error("Error:", error);
      }
    };
  
    fetchData();
  }, [selectedYear]);
let years = Array.from({length: currYear - 2021}, (_, i) => 2022 + i);

  return (
    <div className="w-full">
    <div className="grid grid-cols-3 gap-2 gap-y-3 mx-1 mt-2">
      <div className="col-span-3 mb-3">
<select 
  value={selectedYear} 
  onChange={(e) => setSelectedYear(e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
>
  {years.map(year => (
    <option key={year} value={year}>{year}</option>
  ))}
</select>
      </div>
      <div className="col-span-1">
        <InfoCard2 
          className="h-auto" 
          titleText={"Registered Devices " + "(" + selectedYear + ")"} 
          bodyText={"Estimated: " + new Intl.NumberFormat('en-IN').format(cardData.registered)+" MWh"} 
          Icon={LightBulbIcon} 
          balance={"Actual: " + new Intl.NumberFormat('en-IN').format(cardData.actual) + " MWh"} 
        />
      </div>
      <div className="col-span-1">
        <InfoCard2 
          className="" 
          titleText={"Usage Stats"} 
          bodyText={"Committed: " + new Intl.NumberFormat('en-IN').format(cardData.usage)+" MWh"} 
          bodyText2={"Balance: " + Math.floor(((cardData.registered - cardData.usage) / cardData.registered) * 100) + " %"} 
          Icon={WrenchScrewdriverIcon} 
        />
      </div>
      <div className="col-span-1">
        <InfoCard2 
          className="" 
          titleText={"Pending Devices"} 
          bodyText={"No of pending Devices: " + new Intl.NumberFormat('en-IN').format(cardData.pending)} 
          bodyText2={"Total Capacity: " + new Intl.NumberFormat('en-IN').format(cardData.pendingcap) + " MW"} 
          Icon={CircleStackIcon} 
        />
      </div>
        {/* <Card className="col-span-3 lg:col-span-3 h-auto">
          <CardHeader className="text-center">Estimate vs Usage</CardHeader>
          <EstUse className="h-full" data={estUseMonthData.monthData} />
        </Card> */}
         <Card className="col-span-3 lg:col-span-3 h-auto">
    <CardHeader className="text-center">Estimate vs Usage (Solar/Wind)</CardHeader>
    <Type className="h-full" data={typeData.monthData} />  
  </Card>
        <Card className="col-span-3 lg:col-span-3">
          <CardHeader className="text-center">Estimate vs Actual</CardHeader>
          <EstAct className="h-full" data={estActMonthData.monthData} />
        </Card>
        <div className="col-span-3 mb-3">
        <FooterCard footerData={footerData} selectedYear={selectedYear} /></div>
      </div>
    </div>
  );
};

export default MainGrid;
