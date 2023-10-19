import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";


const getFooterData = async (currYear, prevYear, currMonth, prevMonth)=> {
  const [res_currYearActual, res_prevYearActual, res_currMonthActual, res_prevMonthActual, res_currMonthPrevYear] = await prisma.$transaction([
    prisma.inventory2.aggregate({
      where: {
        Year: currYear
      },
      _sum: {
        Actual: true
      }
    }
    ),
    prisma.inventory2.aggregate({
      where: {
        Year: prevYear
      },
      _sum: {
        Actual: true
      }
    }
    ),
    prisma.inventory2.aggregate({
      where: {
        Year: currYear,
        Month: currMonth
      },
      _sum: {
        Actual: true
      }
    }
    ),
    prisma.inventory2.aggregate({
      where: {
        Year: currYear,
        Month: prevMonth
      },
      _sum: {
        Actual: true
      }
    }
    ),
    prisma.inventory2.aggregate({
      where: {
        Year: prevYear,
        Month: currMonth
      },
      _sum: {
        Actual: true
      }
    }
    ),
  
  ])
const currYearActual = res_currYearActual._sum.Actual+0
const prevYearActual = res_prevYearActual._sum.Actual+0
const currMonthActual = res_currMonthActual._sum.Actual+0
const prevMonthActual = res_prevMonthActual._sum.Actual+0
const currMonthPrevYear = res_currMonthPrevYear._sum.Actual+0
//   // return {currYearActual._sum.Actual+0, prevYearActual._sum.Actual+0, currMonthActual._sum.Actual+0, prevMonthActual._sum.Actual+0, currMonthPrevYear._sum.Actual+0}
// console.log(currYearActual, prevYearActual,currMonthActual,prevMonthActual,currMonthPrevYear)
return {currYearActual, prevYearActual,currMonthActual,prevMonthActual,currMonthPrevYear};
};

const FooterCard = async (Icon) =>{

  let currYear = new Date().getFullYear();
  let prevYear = parseInt(currYear) -1
  let makeDateCurr = new Date()
  makeDateCurr.setMonth(makeDateCurr.getMonth()-1)
  let currMonth = makeDateCurr.toLocaleString('en-US', {month: 'long'});
  
  let makeDate = new Date()
  makeDate.setMonth(makeDate.getMonth() - 2)
  let prevMonth = makeDate.toLocaleString('en-US', {month: 'long'});
  const footerData = await getFooterData(currYear, prevYear, currMonth, prevMonth)

  //Percentage change in actual generation compared to last year
  const yearChangePercent = Math.floor(((footerData.currYearActual - footerData.prevYearActual) / footerData.prevYearActual +1) * 100)

  //Percentage change in year-on-year for the present month
  const yoyChangePercent = Math.floor(((footerData.currMonthActual - footerData.currMonthPrevYear) / footerData.currMonthPrevYear +1) * 100)
  //Percentage change in current month compared to previous month
  const monthChangePercent = Math.floor(((footerData.currMonthActual - footerData.prevMonthActual) / footerData.prevMonthActual +1) * 100)

  return (
    <Card className="text-primarybase hover:bg-slate-50 w-full">
      <div>
        <CardHeader className="">Energy Generation Summary</CardHeader>
        {/* <CardHeader className="">Snapshot Summary2</CardHeader> */}
      </div>

      <CardContent className="flex justify-between">
        <div className="my-auto w-1/3 px-2">
          <div className="h-4 p-1">{`${prevYear}: ${footerData.prevYearActual} MWH`}</div>
          <h4 className="p-1">{`${currYear}: ${footerData.currYearActual} MWH`}</h4>
          <div className="h-6">
            +{yearChangePercent} %
          </div>

          <div class="h-1 w-full bg-neutral-200 dark:bg-neutral-600">
            <div class={`h-1  bg-teal-500 rounded-lg w-[${yearChangePercent}%]`}></div>
          </div>
        </div>
        <div className="my-auto w-1/3 px-2">
        <div className="h-4 p-1">{`${currMonth} (${prevYear}) : ${footerData.currMonthPrevYear} MWH`}</div>
          <h4 className="p-1">{`${currMonth} (${currYear}) : ${footerData.currMonthActual} MWH`}</h4>
          <div className="h-6">
            +{yoyChangePercent} %
          </div>

          <div class="h-1 w-full bg-neutral-200 dark:bg-neutral-600">
          <div class={`h-1  bg-teal-500 rounded-lg w-[${yoyChangePercent}%]`}></div>
          </div>
        </div>
        <div className="my-auto w-1/3 px-2">
        <div className="h-4 p-1">{`${prevMonth} (${currYear}) : ${footerData.prevMonthActual} MWH`}</div>
          <h4 className="p-1">{`${currMonth} (${currYear}) : ${footerData.currMonthActual} MWH`}</h4>
          <div className="h-6">
            +{monthChangePercent} %
          </div>

          <div class="h-1 w-full bg-neutral-200 dark:bg-neutral-600">
          <div class={`h-1  bg-teal-500 rounded-lg w-[${monthChangePercent}%]`}></div>
          </div>
        </div>
        {/* <div className="my-auto">{Icon && <Icon className="h-12 w-12" />}</div> */}
      </CardContent>
    </Card>
  );
}

export default FooterCard;
