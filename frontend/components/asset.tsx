import Link from 'next/link';
import React from 'react'

interface propTypes {
     id: number;
    propertyName: string;
     propertyAbout: string;
    propertyValue: number;
    sharesAvailable: number;
    sharesSold: number;
    status: number;
    rentValuePerYear: number;
    startTime: number,
    endTime: number,
    rentee: string,
    paid: boolean,
}

const Asset = ({id, propertyName, propertyAbout, propertyValue, rentValuePerYear}: propTypes) => {
  return (
    <Link href={`/assets/${id}`}>
    <div className='rounded-lg p-4 shadow-md cursor-pointer'>
        <h4 className='text-3xl font-semibold mb-4'>
        {propertyName}
        </h4>
        
        <p className='line-clamp-2 mb-4 font-light'>{propertyAbout}</p>
        <div className='text-2xl font-semibold text-yellow-500 '>
            BNB {propertyValue}
        </div>
    </div>
    </Link>
    
  )
}

export default Asset