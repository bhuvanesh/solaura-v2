import React from 'react'
import { buyers } from '@/data/data'
import {ShoppingBagIcon} from '@heroicons/react/24/outline'

const BuyerList = () => {
  return (
    <div className='w-full md:col-span-2 relative m-auto p-4 border rounded-lg bg-white overflow-scroll'>
        <h1>Top Energy Buyers</h1>
        <ul>
            {buyers.map((item, id)=>{
                return(
                <li key={id} className='bg-gray-50 hover:bg-gray-100 rounded-lg my-1 p-1 flex items-center cursor-pointer text-black'>
                    <div className='bg-purple-100 rounded-lg p-2'>
                        <ShoppingBagIcon className='text-purple-800'/>
                    </div>
                    <div className='m-2'>
                    <p className='text-gray-800 font-bold'> {item.total} kWh</p>
                    <p className='text-gray-600'>{item.group}</p>
                    </div>
                    {/* <p className='lg:flex md:hidden absolute right-6'>{}</p> */}
                </li>)
            })}
        </ul>
        </div>
  )
}

export default BuyerList