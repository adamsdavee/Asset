import React, {useContext, useEffect} from 'react';
import { SharesType } from '@/types/site';
import Link from 'next/link';
import AppContext from '@/context/app-context';


const Share = ({assetId, sharesValueInBNB}: SharesType) => {
  const appCtx = useContext(AppContext)
  
    
    const { connected, assets,  } = appCtx

    useEffect(() => {
      if (connected) {
        
      }
    })

  const asset = assets.filter((asset) => asset.id === assetId )[0]

  const {
    id,
    propertyName,
    propertyAbout,
    propertyValue,
    sharesAvailable,
    sharesSold,
    status,
    rentValuePerYear,
    startTime,
    endTime,
    rentee,
    paid,
} = asset

  return (
    <Link href={`/shares/${assetId}`}>
    <div className='rounded-lg p-4 shadow-md cursor-pointer'>
        <h4 className='text-3xl font-semibold  mb-4'>
        {propertyName}
        </h4>

        <div className='flex mb-2'>
          <p className='mr-4'>Available: {sharesAvailable},</p>
          <p>Sold: {sharesSold}</p>
        </div>
        
        <div className='text-yellow-500 text-2xl font-semibold '>
            BNB {sharesValueInBNB}
        </div>
    </div>
    </Link>
    
  )
}

export default Share