import React from 'react'
import ListItem from './ListItem'
import {PresentationChartBarIcon, SparklesIcon, ArrowUpTrayIcon, BanknotesIcon, DocumentMagnifyingGlassIcon} from "@heroicons/react/24/solid"
import { UserButton, useUser } from '@clerk/nextjs';

const Sidebar = () => {
  const { user } = useUser();

  return (
    <div className='min-h-screen  max-w-[20rem] min-w-max p-4 shadow-xl shadow-cyan-950 text-white bg-sky-900'>
    <div className='flex flex-col items-start'>
        <ListItem text={'Dashboard Home'} navLink={'/dash'} Icon={PresentationChartBarIcon}/>
        <ListItem text={'Allocate'} navLink={'/dash/allocate'} Icon={SparklesIcon}/>
        <ListItem text={'Upload Data'} navLink={'/dash/upload'} Icon={ArrowUpTrayIcon}/>
        <ListItem text={'Transactions'} navLink={'/dash/txn'} Icon={BanknotesIcon}/>
        <ListItem text={'Summary'} navLink={'/dash/sum'} Icon={DocumentMagnifyingGlassIcon}/>
        <ListItem text={'Group Summary'} navLink={'/dash/group'} Icon={SparklesIcon}/>        
    </div>
    <div className='flex items-center mb-4 mt-4 ml-2'>
        <UserButton afterSignOutUrl='/' />
        {user && <span className='ml-2'>{user.username}</span>}
      </div>
</div>

  )
}

export default Sidebar;