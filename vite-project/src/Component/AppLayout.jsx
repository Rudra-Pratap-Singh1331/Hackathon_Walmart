import React from 'react'
import CustomerNavbar from './CustomerNavbar'
import { Outlet } from 'react-router-dom'

const AppLayout = () => {
  return (<>
    <CustomerNavbar/>
    <Outlet/>
    </>
  )
}

export default AppLayout