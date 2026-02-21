import OrderSuccessPage from '@/components/order/OrderSuccessPage'
import React from 'react'

export default function page({params}) {
  return (
    <div>
      <OrderSuccessPage id={params.id}/>
    </div>
  )
}
