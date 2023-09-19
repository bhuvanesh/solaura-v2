import React from "react";
import InfoCard from "./cards/InfoCard";
import { ChartBarSquareIcon, LightBulbIcon, CircleStackIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
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

const getCardData = async () => {
  const res = await fetch("http:localhost:3000/api/data/cards", {
    // next: { revalidate: 5 },
  });
  // console.log(await res.json())
  return res.json();
};

const getEstActData = async () => {
  const res = await fetch("http:localhost:3000/api/data/months");

  return res.json();
};

const getEstUseData = async () => {
    const res = await fetch("http:localhost:3000/api/data/usage");
  
    return res.json();
  };

const MainGrid = async () => {
  const cardData = await getCardData();
  const estActMonthData = await getEstActData();
  const estUseMonthData = await getEstUseData()
  console.log(estUseMonthData)
  //   console.log(cardData, estActMonthData);
  let currYear = new Date().getFullYear();
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 gap-y-3 mx-1 mt-2">
        <InfoCard2
          titleText={"Registered Devices " + "(" + currYear + ")"}
          bodyText={"Estimated: " + cardData.registered}
          Icon={LightBulbIcon}
          balance={"Actual: " + cardData.actual + " kWh"}
        />
        <InfoCard2
          titleText={"Pending Devices "}
          bodyText={"Estimated: " + cardData.pending}
          Icon={WrenchScrewdriverIcon}
        />
        <InfoCard2
          titleText={"Pipeline Devices"}
          bodyText={"Estimated: " + cardData.pipeline}
          Icon={CircleStackIcon}
        />
           <Card className="col-span-2 h-auto">
          <CardHeader className="text-center">Estimate vs Usage</CardHeader>
          <EstUse className='h-full' data={estUseMonthData.monthData} />
        </Card>
        <Card className="">
            <BuyerList/>
        </Card>
        <Card className="col-span-2">
          <CardHeader className="text-center">Estimate vs Actual</CardHeader>
          <EstAct className="h-full" data={estActMonthData.monthData} />
        </Card>
        <Card className="">
            <SellerList/>
        </Card>
     
      </div>
    </div>
  );
};

export default MainGrid;
