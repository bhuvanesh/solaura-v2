import React from "react";

const InfoCard = ({titleText, bodyText, Icon, balance}) => {
  return (
    <div className="pl-1 w-96 h-28  bg-blue-500 rounded-lg shadow-md">
      <div className="flex w-full h-full py-2 px-4 bg-white rounded-lg justify-between text-primary hover:bg-slate-100">
        <div className="my-auto">
          <p className="font-bold text-lg">{titleText}</p>
          <p className="text-lg">{`${bodyText} Kwh`}</p>
          {balance && <p className="text-md text-teal-600">{balance}</p>}
        </div>
        <div className="my-auto">
         {Icon && <Icon className="h-8 w-8" />}
        </div>
      </div>
      
    </div>
  );
};

export default InfoCard;
