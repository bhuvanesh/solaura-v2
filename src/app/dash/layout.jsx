

import Sidebar from '@/components/sidebar/Sidebar'
import React from 'react'

const layout = ({children}) => {
  return (
    <div className="flex space-x-2">
           <Sidebar/>
            {children}
        </div>
  )
}

export default layout