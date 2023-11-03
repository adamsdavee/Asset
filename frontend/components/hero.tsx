import React, {useContext}from 'react'
import AppContext from '@/context/app-context';
import Link from 'next/link';

const Hero = () => {

const appCtx = useContext(AppContext)
  
const { assets, connected, setup } = appCtx


  return (
    <div className='flex flex-col justify-center items-center p-8'>
        
        <h1 className='text-center text-5xl  mt-8 m-4 max-w-[600px] leading-[64px]'>Buy and Rent Realworld Properties on the Blockchain</h1>

        <p className='text-lg text-center mb-4 max-w-[700px]'>Become a shareholder in real estate properties, rent properties for personal use. Your one click asset to crypto real estate.</p>

    
        {!connected ? <button onClick={setup} className='p-4 px-8 rounded-full bg-black text-white'>Connect Wallet</button>
          :
          <Link href={"/assets"}>
          <button className='p-4 px-8 rounded-full bg-black text-white'>Explore Assets</button>
          </Link>
        
        }
    </div>
  )
}

export default Hero