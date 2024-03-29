"use client"
import React from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const EstUse = ({data}) => {
  const dataMax = 250000
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
          tickFormatter={(value) => `${value} kWh`}
          type="number" domain={[0, dataMax]}
          padding={{ top:10 }}
          width={100}
          
          // scale="band"
        />
        {/* <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} stroke='green' /> */}
        <Bar dataKey="Estimate" fill="#0c4a6e" radius={[4, 4, 0, 0]}  />
        <Bar dataKey="Usage" fill="#5eead4" radius={[4, 4, 0, 0]}  />
        <Tooltip cursor={{ stroke: 'green', strokeWidth: 0.1, fill: 'rgba(206, 206, 206, 0.1)'  }}/>
      </BarChart>
    </ResponsiveContainer>
   
  )
}

export default EstUse