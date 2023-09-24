import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

const InfoCard2 = ({ titleText, bodyText,bodyText2, Icon, balance }) => {
  return (
    <Card className="text-primarybase hover:bg-slate-50">
      <CardHeader>{titleText}</CardHeader>
      <CardContent className='flex justify-between'>
        <div className="my-auto">
          {/* <p className="font-bold text-lg">{titleText}</p> */}
          <p className="text-lg">{`${bodyText} Kwh`}</p>
          {bodyText2 &&  <p className="text-lg">{`${bodyText2}`}</p>}
          {balance && <p className="text-md text-teal-600">{balance}</p>}
        </div>
        <div className="my-auto">{Icon && <Icon className="h-12 w-12" />}</div>
      </CardContent>
    </Card>
  );
};

export default InfoCard2;
