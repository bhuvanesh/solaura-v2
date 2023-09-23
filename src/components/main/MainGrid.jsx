// "use client"
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

import { prisma } from "@/lib/prisma";



const getCardData = async () => {
  // const res = await fetch("/api/data/cards", {
  //   // next: { revalidate: 5 },
  // });

  const [reg, pen, pip, act] = await prisma.$transaction([
    prisma.inventory.aggregate({
      _sum: {
        Estimated: true,     
      },
      where: {
        Registered: {
          equals: "YES",
        },
      },
    }),
    prisma.inventory.aggregate({
      _sum: {
        Estimated: true,
      },
      where: {
        Registered: {
          equals: "PENDING",
        },
      },
    }),
    prisma.inventory.aggregate({
      _sum: {
        Estimated: true,
      },
      where: {
        Registered: {
          equals: "PIPELINE",
        },
      },
    }),
    prisma.inventory.aggregate({
      _sum: {
        Actual: true,
      },
      where: {
        Registered: {
          equals: "YES",
        },
      },
    }),
  ]);


  // console.log(await res.json())
  return { registered: reg._sum.Estimated, pending: pen._sum.Estimated, pipeline: pip._sum.Estimated, actual: act._sum.Actual };
};

const getEstActData = async () => {
  // const res = await fetch("/api/data/months")
  const [data] = await prisma.$transaction([
    //what is required? Monthwise Actuals

    prisma.inventory.groupBy({
      by: ["Month", "Year"],
      _sum: {
        Actual: true,
        Estimated: true,
      },
      where: {
        Registered: {
          equals: "YES",
        },
      },
    }),

    // console.log('data: ',data)
  ]);

  const monthData = [];


  for (let item of data) {
    monthData.push({
      month: item.Month,
      Actual: item._sum.Actual,
      Estimate: item._sum.Estimated
    });
  }
  return { monthData };

  // return res.json();
};

const getEstUseData = async () => {
    // const res = await fetch("/api/data/usage");
    const [data] = await prisma.$transaction([
      //what is required? Monthwise Actuals
  
      prisma.inventory.groupBy({
        by: ["Month", "Year"],
        _sum: {
          Estimated: true,
          Actual_used: true,
          Estimated_used: true
        },
        where: {
          Registered: {
            equals: "YES",
          },
        },
      }),
  
      // console.log('data: ',data)
    ]);
  
    const monthData = [];
  
  
    for (let item of data) {
      monthData.push({
        month: item.Month,
        Usage: item._sum.Actual_used + item._sum.Estimated_used,
        Estimate: item._sum.Estimated
      });
    }
    return { monthData };
  
    // return res.json();
  };

const MainGrid = async () => {


  const cardData = await getCardData();
  // console.log(cardData)
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
