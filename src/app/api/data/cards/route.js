// import { prisma } from '@/lib/prisma'

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { NextResponse } from "next/server";

export async function GET() {
  const [reg, pen, pip, act] = await prisma.$transaction([
    prisma.table.aggregate({
      _sum: {
        Estimated: true,     
      },
      where: {
        Registered: {
          equals: "YES",
        },
      },
    }),
    prisma.table.aggregate({
      _sum: {
        Estimated: true,
      },
      where: {
        Registered: {
          equals: "PENDING",
        },
      },
    }),
    prisma.table.aggregate({
      _sum: {
        Estimated: true,
      },
      where: {
        Registered: {
          equals: "PIPELINE",
        },
      },
    }),
    prisma.table.aggregate({
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

  return NextResponse.json({ registered: reg._sum.Estimated, pending: pen._sum.Estimated, pipeline: pip._sum.Estimated, actual: act._sum.Actual });
}

GET()
  .catch((e) => {
    console.log("error in Prisma : ", e);
  })
  .finally(() => {
    console.log("Yaay");
  });
