import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '5px', border: '1px solid #ccc' }}>
        <p className="label">{`${label}`}</p>
        <p style={{ color: payload[0].color }}>
          {`Estimate: ${new Intl.NumberFormat('en-IN').format(payload[0].value)}`}
        </p>
        <p style={{ color: payload[1].color }}>
          {`Actual: ${new Intl.NumberFormat('en-IN').format(payload[1].value)}`}
        </p>
      </div>
    );
  }

  return null;
};

const EstAct = ({ data }) => {
  const dataMax = 300000;
  return (
    <>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
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
            tickFormatter={(value) => `${value} MWh`}
            fontSize={10}
            stroke="#0c4a6e"
            type="number"
            domain={[0, dataMax]}
            padding={{ top: 10 }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
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
