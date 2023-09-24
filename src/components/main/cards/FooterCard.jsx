import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";

const FooterCard = (Icon) => {
  return (
    <Card className="text-primarybase hover:bg-slate-50 w-full">
      <div>
        <CardHeader className="">Energy Generation Summary</CardHeader>
        {/* <CardHeader className="">Snapshot Summary2</CardHeader> */}
      </div>

      <CardContent className="flex justify-between">
        <div className="my-auto w-1/3 px-2">
          <div className="h-4 p-1">2022: 300290731 Kwh</div>
          <h4 className="p-1">2023: 350290731 Kwh</h4>
          <div className="h-6">
            +{Math.floor(((350290731 - 300290731) / 300290731) * 100)} %
          </div>

          <div class="h-1 w-full bg-neutral-200 dark:bg-neutral-600">
            <div class="h-1  bg-teal-500 rounded-lg w-[16%]"></div>
          </div>
        </div>
        <div className="my-auto w-1/3 px-2">
          <div className="h-4 p-1">June (2022): 0 Kwh</div>
          <h4 className="p-1">June (2023): 115038240 Kwh</h4>
          <div className="h-6">
            +{Math.floor(((115038240 - 0) / 115038240) * 100)} %
          </div>

          <div class="h-1 w-full bg-neutral-200 dark:bg-neutral-600">
            <div class="h-1  bg-teal-500 rounded-lg"></div>
          </div>
        </div>
        <div className="my-auto w-1/3 px-2">
          <div className="h-4 p-1">May (2023): 57063692 Kwh</div>
          <h4 className="p-1">June (2023): 115038240 Kwh</h4>
          <div className="h-6">
            +{Math.floor(((115038240 - 57063692) / 115038240) * 100)} %
          </div>

          <div class="h-1 w-full bg-neutral-200 dark:bg-neutral-600">
            <div class="h-1  bg-teal-500 rounded-lg w-[50%]"></div>
          </div>
        </div>
        {/* <div className="my-auto">{Icon && <Icon className="h-12 w-12" />}</div> */}
      </CardContent>
    </Card>
  );
};

export default FooterCard;
