import React from 'react'
import ListItem from './ListItem'
import {PresentationChartBarIcon, SparklesIcon, ArrowUpTrayIcon} from "@heroicons/react/24/solid"
import Link from 'next/link'

const Sidebar = () => {
  return (
    <div className='min-h-screen  max-w-[20rem] min-w-max p-4 shadow-xl shadow-cyan-950 text-white bg-sky-900'>
    <div className='flex flex-col items-start'>
        <ListItem text={'Dashboard Home'} navLink={'/dash'} Icon={PresentationChartBarIcon}/>
        <ListItem text={'Allocate'} navLink={'/dash/allocate'} Icon={SparklesIcon}/>
        <ListItem text={'Upload Data'} navLink={'/dash/upload'} Icon={ArrowUpTrayIcon}/>        
    </div>
</div>
  )
}

export default Sidebar