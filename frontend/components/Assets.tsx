import React, {useContext, useEffect} from 'react'
import AppContext from '@/context/app-context'
import Asset from './asset'
import { AssetType } from '@/types/site'
interface propTypes {
  assets: AssetType[]
}

const Assets = ({assets}: propTypes) => {
  



  return (
    <div className='w-full grid grid-cols-2 gap-2 p-4'>
        {assets.map((asset, index) => {
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

          return <Asset key={index} 
          id={id}
            propertyName={propertyName}
            propertyAbout={propertyAbout}
            propertyValue={propertyValue}
            sharesAvailable={sharesAvailable}
            sharesSold={sharesSold}
            status={status}
            rentValuePerYear={rentValuePerYear}
            startTime={startTime}
            endTime={endTime}
            rentee={rentee}
            paid={paid}
            />
        })}
    </div>
  )
}

export default Assets