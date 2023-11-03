import React, { useState, useContext } from 'react'
import AppContext, { toWei } from '@/context/app-context';
import { Contract } from 'ethers';

const Deposit = () => {
    const appCtx = useContext(AppContext)
    const [amount, setAmount] = useState(0)
    const [ done, setDone] = useState(false)

    const {contract, signer, balance } = appCtx

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(Number(e.target.value))
      }

    const handleDesposit= async () => {
        if (amount <= 0 ) {
            return
        }
        const response = await (contract!.connect(signer!) as Contract).deposit!({value:  toWei(`${amount}`)})


        console.log(response)
        setDone(true)
    }

    if (done) {
      return <div className='text-center'>Done</div>
    }

  return (
    <div className='py-8 px-4 flex flex-col items-center'>
        <h2 className='text-3xl text-center mb-4'>Deposit BNB</h2>

        <input className='w-full max-w-[300px] border px-4 py-2 rounded-lg mb-4' type="number" placeholder={"Amount"} step="0.01" min="0" max={`${balance}`} onChange={handleAmountChange} value={amount} />

        <button onClick={handleDesposit} className='p-4 px-8 rounded-full bg-black text-white text-sm mx-auto'>Confirm Buy</button>
    </div>
  )
}

export default Deposit