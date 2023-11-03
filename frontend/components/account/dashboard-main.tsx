import React, {useState, useContext, useEffect} from 'react'
import Assets from '../Assets'
import AppContext from '@/context/app-context';
import { SHARES_DATA } from '@/config/test-data';
import Shares from '../shares';

type InViewType = "occupancies" | "shares" | ""

const DashboardMain = () => {
    const appCtx = useContext(AppContext)
  
    const { connected, assets, getAssets, getShares, signerAddress } = appCtx
    const [inView, setInView] = useState<InViewType>("occupancies")

    const handleChangeInView = (val: InViewType) => {
        console.log({val})
        setInView(val)
    }

    const assetsOccupied = assets.filter(asset => asset.rentee === signerAddress)

    useEffect(() => {
      if (connected) {
        if (inView === "occupancies")
            getAssets()

        if (inView === "shares")
            getShares()
      }
        
        
    }, [inView, connected])

  return (
    <div className='p-4'>
        <div className='grid grid-cols-2 gap-4'>
            <div onClick={() => {handleChangeInView("occupancies")}} className={`border cursor-pointer  px-4 py-2 rounded-full text-center ${inView === "occupancies" && "bg-black text-white"}`}>Occupancies</div>

            <div onClick={() => {handleChangeInView("shares")}} className={`border cursor-pointer  px-4 py-2 rounded-full text-center ${inView === "shares" && "bg-black text-white"}`}>My Shares</div> 
      </div>

      {inView === "occupancies" && <Assets assets={assetsOccupied} />}

      {inView === "shares" && <Shares shares={SHARES_DATA} />}
    </div>
  )
}

export default DashboardMain