import React, {useContext, useEffect, useState }from 'react'
import AppContext from '@/context/app-context';
import { Contract } from 'ethers';

interface propTypes {
     assetId: number;
}

type ActionInViewType = "buy" | "sell" | "lock" | "unlock"

const ShareView = ({assetId}: propTypes) => {
const appCtx = useContext(AppContext)
const [actionInView, setActionInView] = useState<ActionInViewType>("buy")
const [amount, setAmount] = useState(0)
const [time, setTime] = useState(0)
  
  const { connected, assets, shares, setup, getShares, getAssets, signerAddress, contract, signer } = appCtx

  const handleChangeAactionInView = (val: ActionInViewType) => {
    setActionInView(val)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value))
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(Number(e.target.value))
  }


  const handleBuy = async() => {
    if (contract) {
      return
    }
      const response = await (contract!.connect(signer!) as Contract).buyShares(assetId, amount)

      console.log({response})
      setAmount(0)
  }

  const handleSell = async() => {
    if (contract) {
      return
    }
      const response = await (contract!.connect(signer!) as Contract).sellShares(assetId, amount)

      console.log({response})
      setAmount(0)
  }

  const handleLock = async() => {
    if (contract) {
      return
    }
      const response = await (contract!.connect(signer!) as Contract).lockShares(assetId, amount, time)

      console.log({response})
      setAmount(0)
      setTime(0)
  }

  const handleUnlock = async() => {
    if (contract) {
      return
    }
      const response = await (contract!.connect(signer!) as Contract).unlockShares(assetId)

      console.log({response})
      setAmount(0)
  }

  useEffect(() => {
    if (connected) {
      getAssets()
      getShares()
    }
  }, [connected])

  if (!connected) {
    return <>Not connected</>
  }

  

    const share = shares.filter((share) => assetId === share.assetId)[0]

    console.log({share})

    const {
        walletAddress,
        sharesValueInPercentage,
        sharesValueInBNB,
        locked,
        lockedTime,
    } = share
  
  

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

  const isRentee = signerAddress === rentee
  // const isShareHolder = 
  const hasShares = sharesValueInPercentage > 0
  const hasLockedShares = hasShares && (locked > 0)
  

  return (
    <div className=' rounded-lg grid grid-cols-12 gap-4 p-4  cursor-pointer'>
        <div className='col-span-8'>
            <h4 className='text-5xl  mb-4 leading-[64px]'>
            Manage Shares for <br/><span className='text-blue-400'>{propertyName}</span>
            </h4>
            <div className='grid grid-cols-3 gap-4 mb-8'>
                <div className='shadow-md rounded-lg p-4 text-center'>
                    You own <br/><span className='text-2xl font-bold'>{sharesValueInPercentage}%</span>
                    
                    of this asset.
                </div>

                <div className='shadow-md rounded-lg p-4 text-center'>
                    Your share is <br/><span className='text-2xl font-bold'>{sharesValueInBNB} BNB</span>
                    <br/>
                     worth.
                </div>

                <div className='shadow-md rounded-lg p-4 text-center'>
                    You&apos;ve locked <br/><span className='text-2xl font-bold'>{locked}%</span>
                    <br/>
                     shares.
                </div>
            </div>

            <div className='grid grid-cols-4 gap-4 mb-4'>
                <button onClick={() => {handleChangeAactionInView("buy")}} className={`p-4 px-8 rounded-full shadow-md text-sm ${actionInView === "buy" && "bg-black text-white shadown-none"}`}>Buy</button>

                <button onClick={() => {handleChangeAactionInView("sell")}} className={`p-4 px-8 rounded-full shadow-md text-sm ${actionInView === "sell" && "bg-black text-white shadown-none"}`}>Sell</button>
                <button onClick={() => {handleChangeAactionInView("lock")}} className={`p-4 px-8 rounded-full shadow-md text-sm ${actionInView === "lock" && "bg-black text-white shadown-none"}`}>Lock</button>

                {hasLockedShares && <button onClick={() => {handleChangeAactionInView("unlock")}} className={`p-4 px-8 rounded-full shadow-md text-sm ${actionInView === "unlock" && "bg-black text-white shadown-none"}`}>Unlock</button>}
            </div>

            <div className='border border-dashed rounded-xl p-4'>
                {actionInView === "buy" && <h4 className='text-lg mb-2 text-center'>Buy Shares</h4>}
                {actionInView === "sell" && <h4 className='text-lg mb-2 text-center'>Sell Shares</h4>}
                {actionInView === "lock" &&<h4 className='text-lg mb-2 text-center'>Lock Shares</h4>}
                {actionInView === "unlock" &&<h4 className='text-lg mb-2 text-center'>Unlock Shares</h4>}
               

                <div className='grid gap-4 mb-4'>
                <input className='border px-4 py-2 rounded-lg' type="number" placeholder="Amount" min="0" onChange={handleAmountChange} value={amount} />

                {actionInView === "lock" && <input className='border px-4 py-2 rounded-lg' placeholder="Time in days" type="number"  min="0" />}
                </div>

                <div className='flex'>

                {actionInView === "buy" && <button onClick={handleBuy} className='p-4 px-8 rounded-full bg-black text-white text-sm mx-auto'>Confirm Buy</button>}
                {actionInView === "sell" && <button onClick={handleSell} className='p-4 px-8 rounded-full bg-black text-white text-sm mx-auto'>Confirm Sell</button>}
                {actionInView === "lock" && <button onClick={handleLock} className='p-4 px-8 rounded-full bg-black text-white text-sm mx-auto'>Confirm Lock</button>}
                {actionInView === "unlock" && <button onClick={handleUnlock} className='p-4 px-8 rounded-full bg-black text-white text-sm mx-auto'>Confirm Unlock</button>}
                </div>
                
            </div>
            
        </div>

        <div className='col-span-4  divide-y'>
           
           
            <div className='p-4'>
            <h3 className='text-xl mb-2 font-semibold'>Asset Details </h3>
                <div className='mb-4'>
                    <p className='text-3xl font-bold text-center text-green-400'>
                        {rentValuePerYear} BNB
                    </p>
                    <p className='text-sm text-black text-center'>per year</p>
                </div>
                

                

                <div className='mb-4 text-sm bg-red-500 text-white px-4 py-1 text-center rounded-md '>
                    {status}
                </div>

                
            </div>


            <div className='p-4'>
                <div className='mb-4'>
                    <h6 className='text-lg font-semibold mb-2'>Property Value</h6>
                    <p className='text-3xl text-center font-bold border border-dashed rounded-md p-2'>
                        {propertyValue} BNB
                    </p>
                </div>
                

                <div>
                    Shares available: {sharesAvailable}
                </div>

                <div className='mb-4'>
                    Shares sold: {sharesSold}
                </div>

               
      
            </div>
              </div>
        
        
    </div>
  )
}

export default ShareView