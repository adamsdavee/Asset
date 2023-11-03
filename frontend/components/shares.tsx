import React, {useContext, useEffect} from 'react'
import AppContext from '@/context/app-context'
import Asset from './asset'
import { AssetType, SharesType } from '@/types/site'
import Share from './share'
interface propTypes {
  shares: SharesType[]
}

const Shares = ({shares}: propTypes) => {
  
    

  return (
    <div className='w-full grid grid-cols-2 gap-2 p-4'>
        {shares.map((share, index) => {
          const {
            walletAddress,
            assetId,
            propertyName,
            sharesValueInPercentage,
            sharesValueInBNB,
            locked,
            lockedTime,
        } = share

          return <Share key={index} 
          walletAddress={walletAddress}
          assetId={assetId}
          propertyName={propertyName}
          sharesValueInPercentage={sharesValueInPercentage}
          sharesValueInBNB={sharesValueInBNB}
          locked={locked}
          lockedTime={lockedTime}
            
            />
        })}
    </div>
  )
}

export default Shares