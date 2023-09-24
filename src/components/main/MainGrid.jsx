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
import FooterCard from "./cards/FooterCard";



const getCardData = async (currYear) => {
  // const res = await fetch("/api/data/cards", {
  //   // next: { revalidate: 5 },
  // });

  const [reg, pen, pip, act] = await prisma.$transaction([
    prisma.inventory.aggregate({
      _sum: {
        Estimated: true,
        Estimated_used: true     
      },
      where: {
        Registered: {
          equals: "YES",
        },
        Year: currYear
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
        Year: currYear
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
        Year: currYear
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
        Year: currYear
      },
    }),
    // prisma.inventory.aggregate({
    //   _sum: {
    //     Estimated_used: true,
    //   },
    //   where: {
    //     Registered: {
    //       equals: "YES",
    //     },
    //     Year: currYear
    //   },
    // }),
  ]);


  // console.log(await res.json())
  return { registered: reg._sum.Estimated, pending: pen._sum.Estimated, pipeline: pip._sum.Estimated, actual: act._sum.Actual, usage: reg._sum.Estimated_used };
};

const getEstActData = async (currYear) => {
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
        Year: currYear
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

const getEstUseData = async (currYear) => {
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
          Year: currYear
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

  let currYear = new Date().getFullYear();

  const cardData = await getCardData(currYear);
  console.log(cardData)
  const estActMonthData = await getEstActData(currYear);
  const estUseMonthData = await getEstUseData(currYear)
  console.log(estUseMonthData)
  //   console.log(cardData, estActMonthData);
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
          titleText={"Usage Stats"}
          bodyText={"Committed: " + cardData.usage}
          bodyText2={"Balance: " + Math.floor(((cardData.registered - cardData.usage)/cardData.registered)*100) + " %"}
          Icon={WrenchScrewdriverIcon}
        />
        <InfoCard2
          titleText={"Under Registration"}
          bodyText={"Pending: " + cardData.pending}
          bodyText2={"Pipeline: " + cardData.pipeline + " Kwh"}
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
        <div className="col-span-3 mb-3">
        <FooterCard/>
        </div>
        
     
      </div>
    </div>
  );
};

export default MainGrid;
