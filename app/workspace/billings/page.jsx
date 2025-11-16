import { PricingTable } from '@clerk/nextjs'
import React from 'react'

const BillingPage = () => {
  return (
    <div className='p-7'>
      <PricingTable className="bg-gray-900" /> 
    </div>
  )
}

export default BillingPage
