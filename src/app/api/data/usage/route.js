// import { prisma } from '@/lib/prisma'

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { NextResponse } from "next/server";

export async function GET() {
  const [data] = await prisma.$transaction([
    //what is required? Monthwise Actuals

    prisma.table.groupBy({
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
  return NextResponse.json({ monthData });
}

GET()
  .catch((e) => {
    console.log("error in Prisma : ", e);
  })
  .finally(() => {
    console.log("Yaay");
  });
