import React from "react";
import InfoCard from "./cards/InfoCard";
import { ChartBarSquareIcon } from "@heroicons/react/24/outline";

const getData = async () => {
  const res = await fetch("http:localhost:3000/api/data/cards", {
    // next: { revalidate: 5 },
  });
  // console.log(await res.json())
  return res.json();
};

const MainGrid = async () => {
  const cardData = await getData();
  console.log(cardData);
  let currYear = new Date().getFullYear();
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 gap-y-3 mx-1 mt-2">
        <InfoCard
          titleText={"Registered Devices " + "(" + currYear + ")"}
          bodyText={"Estimated: "+cardData.registered}
          Icon={ChartBarSquareIcon}
          balance={"Actual: "+cardData.actual +" kWh"}
        />
        <InfoCard
          titleText={"Pending Devices "}
          bodyText={"Estimated: "+cardData.pending}
          Icon={ChartBarSquareIcon}
        />
        <InfoCard
          titleText={"Pipline Devices"}
          bodyText={"Estimated: "+cardData.pipeline}
          Icon={ChartBarSquareIcon}
        />
      </div>
    </div>
  );
};

export default MainGrid;
