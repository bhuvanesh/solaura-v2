"use client"
import React from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Type = ({data}) => {
  return (

    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} barSize={8}>
        <XAxis
          dataKey="month"
          stroke="#0c4a6e"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#0c4a6e"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value} MWh`}
          padding={{ top:10 }}
          width={100}
          
        />
        {/* <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} stroke='green' /> */}
        <Bar dataKey="solarEstimate" stackId="a" fill="#0c4a6e" radius={[4, 4, 0, 0]}  />
        <Bar dataKey="windEstimate" stackId="a" fill="#5eead4" radius={[4, 4, 0, 0]}  />
        <Bar dataKey="solarUsage" stackId="b" fill="#115e59" radius={[4, 4, 0, 0]}  />
        <Bar dataKey="windUsage" stackId="b" fill="#7dd3fc" radius={[4, 4, 0, 0]}  />
        <Tooltip cursor={{ stroke: 'green', strokeWidth: 0.1, fill: 'rgba(206, 206, 206, 0.1)'  }}/>
      </BarChart>
    </ResponsiveContainer>
   
  )
}

export default Type