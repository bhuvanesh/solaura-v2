"use client";
import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const EstAct = ({ data }) => {
  // console.log('chart accessed' , data)
  const dataMax = 250000
  return (
    <>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          // width={500}
          // height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="month" stroke="#0c4a6e" fontSize={11} />
          <YAxis
            tickFormatter={(value) => `${value} kWh`}
            fontSize={10}
            stroke="#0c4a6e"
            type="number"
            domain={[0, dataMax]} //Modify upperbound and use dataMax variable based on the data
            padding={{ top: 10 }}
            width={70}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Estimate"
            stroke="#0c4a6e"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="Actual" stroke="#f43f5e" />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default EstAct;
