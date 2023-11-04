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

  useEffect(() => {
    fetch("/api/dash/cards", { next: { revalidate: 120 } })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setCardData(data);
      })
      .catch((error) => console.error("Error:", error));

    fetch("/api/dash/graph")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setEstUseMonthData({ monthData: data.monthData.map((item) => ({ month: item.month, Usage: item.usage, Estimate: item.estimate })) });
        setEstActMonthData({ monthData: data.monthData.map((item) => ({ month: item.month, Actual: item.actual, Estimate: item.estimate })) });
        setTypeData({ 
          monthData: data.monthData.map((item) => ({ 
            month: item.month, 
            solarEstimate: item.solarEstimate, 
            windEstimate: item.windEstimate, 
            solarUsage: item.solarUsage, 
            windUsage: item.windUsage 
          })) 
        });
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 gap-y-3 mx-1 mt-2">
        <div className="col-span-3 lg:col-span-1">
          <InfoCard2 className="h-auto" titleText={"Registered Devices " + "(" + currYear + ")"} bodyText={"Estimated: " + cardData.registered} Icon={LightBulbIcon} balance={"Actual: " + cardData.actual + " MWh"} />
        </div>
        <div className="col-span-3 lg:col-span-1">
          <InfoCard2 className="" titleText={"Usage Stats"} bodyText={"Committed: " + cardData.usage} bodyText2={"Balance: " + Math.floor(((cardData.registered - cardData.usage) / cardData.registered) * 100) + " %"} Icon={WrenchScrewdriverIcon} />
        </div>
        <div className="col-span-3 lg:col-span-1">
          <InfoCard2 className="" titleText={"Under Registration"} bodyText={"Pending: " + cardData.pending} bodyText2={"Pipeline: " + cardData.pipeline + " MWh"} Icon={CircleStackIcon} />
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
          <FooterCard />
        </div>
      </div>
    </div>
  );
};

export default MainGrid;
