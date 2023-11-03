import React, {useContext, useEffect, useState }from 'react'
import AppContext from '@/context/app-context';
import NotConnected from './not-connected';

interface propTypes {
     assetId: number;
}

const STATUS_LIST = ["Owing", "Paid", "Available"]

const AssetView = ({assetId}: propTypes) => {
const appCtx = useContext(AppContext)
const [buyAmount, setBuyAmount] = useState(0)
const [buyOpen, setBuyOpen] = useState(false)
  
  const { assets, connected, contract, signer, setup, getAssets, signerAddress, deposit } = appCtx

  useEffect(() => {
    if (connected) {
        getAssets()
      }
    
  }, [connected])

  if (!connected) {
    return  <NotConnected />
  }
  
  

    const asset = assets.filter((asset) => asset.id == assetId )[0]

    if (!asset) {
      return <div>Invalid asset</div>
    }

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

  const handleRent = async () => {
    if (contract) {
      return
    }
      const response = await contract!.connect(signer!).rentShare()
      console.log({response})
  }

  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyAmount(Number(e.target.value))
  }

  const handleOpenBuy = () => {
    setBuyOpen(true)
  }

  const handleBuyShare = async () => {
    if (contract) {
      return
    }
      const response = await contract!.connect(signer!).buyShares(assetId, buyAmount)

      console.log({response})
      setBuyAmount("")
      setBuyOpen(false)
  }

  function createMarkup() {
    return {__html: propertyAbout};
  }

  return (
    <div className=' rounded-lg grid grid-cols-12 gap-4 p-4  cursor-pointer'>
        <div className='col-span-7'>
            <h4 className='text-5xl font-bold mb-4'>
            {propertyName}
            </h4>
            <p className="" dangerouslySetInnerHTML={createMarkup()} ></p>
        </div>

        <div className='col-span-5  divide-y'>
            {isRentee && <div className='border-2 border-black rounded-lg border-dashed p-4 text-center text-blue-400'>
                You are renting this place
              </div>}
            <div className='p-4'>
                <div className='mb-4'>
                    <p className='text-3xl font-bold text-center text-green-400'>
                        BSC {rentValuePerYear} 
                    </p>
                    <p className='text-sm text-black text-center'>per year</p>
                </div>
                

                

                <div className='mb-4 text-sm bg-red-500 text-white px-4 py-1 text-center rounded-md '>
                    {STATUS_LIST[status]}
                </div>

                <div className='mb-4'>You have {deposit} BNB</div>

                <button onClick={handleRent} className='p-4 px-8 rounded-full bg-black text-white '>Rent Asset</button>
            
            </div>


            <div className='p-4'>
                <div className='mb-4'>
                    <h6 className='text-lg font-bold mb-2'>Property Value</h6>
                    <p className='text-3xl text-center font-bold border border-dashed rounded-md p-2'>
                        {propertyValue} BSC
                    </p>
                </div>
                

                <div>
                    Shares available: {sharesAvailable}
                </div>

                <div className='mb-4'>
                    Shares sold: {sharesSold}
                </div>

                {!buyOpen && <button onClick={handleOpenBuy} className='p-4 px-8 mb-4 rounded-full bg-black text-white'>Buy Asset</button>}
                {buyOpen && <div className='border rounded-lg p-2 pt-4 '>
                  <label htmlFor='rent-per-year' className='mb-2 block'>Amount (BNB)</label>
                  <input className='w-full max-w-[300px] border px-4 py-2 rounded-lg mb-4' type="number" placeholder="0.1" step="0.01" min="0" max={"" + deposit} onChange={handleBuyAmountChange} value={buyAmount } />
                  <button onClick={handleOpenBuy} className='p-4 px-8 rounded-full bg-black text-white'>Buy Asset</button>
                  </div>}
            </div>
              </div>
        
        
    </div>
  )
}

export default AssetView