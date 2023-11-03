import React, {useContext} from 'react'
import AppContext from '@/context/app-context';

const NotConnected = () => {
    const appCtx = useContext(AppContext)
  
  const { connected, setup, } = appCtx

  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center'>
        <h2 className='mb-4 text-3xl' >You are not connected</h2>
        <p className='mb-4'>Pls connect wallet</p>

        <button onClick={setup} className='p-4 px-8 rounded-full bg-black text-white'>Connect Wallet</button>
    </div>
  )
}

export default NotConnected