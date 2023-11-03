import React, {useContext} from 'react'
import Nav from '@/components/layout/nav'
import AppContext from '@/context/app-context'
import Link from 'next/link'
import { formatAddress } from '@/lib/utils'

const Header = () => {
    const appCtx = useContext(AppContext)
  
  const { connected, setup, getAssets, signerAddress } = appCtx

  return (
    <div className='flex justify-between items-center py-4 px-4 border'>
        <Link href={"/"}>
          <div>
              AssetBloc
          </div>
        </Link>
        

        <Nav />

        <div className='flex items-center'>
            {connected && <p className='mr-2 text-sm hidden sm:block'>{formatAddress(signerAddress!)}</p>}
        <div className={`rounded-full  w-4 h-4 ${connected ? "bg-blue-400" : "bg-red-500"}`}>

</div>
        </div>
        
    </div>
  )
}

export default Header