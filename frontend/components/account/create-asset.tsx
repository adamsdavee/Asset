import React, { useState, useContext } from 'react'
import AppContext, { toWei } from '@/context/app-context';
import { Contract } from 'ethers';
const lorem = `Fully furnished house available for monthly rent

Listing offers;
Gated Estate
24/7 MP security.
24/7 unlimited internet
standby generator
Treated water
Smart TVs
Fridge
Washing Machine
Dstv, Netflix, PrimeTv etc
House cleaning
PS5 **
Etc

Service Charge covers;
Electricity
Cleaning
Security
Internet

Pictures are Exact photos of this listing!

Shared!

Agency: N75,000 (one-off & non-refundable)
Legal: N75,000 (one-off & non-refundable)
Caution: N100,000 (Refundable upon rent expiration)

Content from Nigeria Property Centre
Read more at: https://nigeriapropertycentre.com/for-rent/flats-apartments/mini-flats/lagos/lekki/1868703-luxury-furnished-one-bedroom-serviced-apartment`;


const CreateAsset = () => {
    const appCtx = useContext(AppContext)
    const [propertyName, setPropertyName] = useState("")
    const [propertyAbout, setPropertyAbout] = useState("")
    const [propertyValue, setPropertyValue] = useState(0)
    const [rentPerYear, setRentPerYear] = useState(0)
    const [added, setAdded] = useState(false)

    const {contract, signer, balance } = appCtx

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPropertyName(e.target.value)
      }

      const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPropertyAbout(e.target.value)
      }

      const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPropertyValue(Number(e.target.value))
      }

      const handleRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRentPerYear(Number(e.target.value))
      }

    const handleAddAsset = async () => {
        if (propertyName.trim() === "" ) {
            return
        }
        if (propertyAbout.trim() === "" ) {
          return
        }
        if ((rentPerYear < 0) || propertyValue < 0 ) {
          return
        }

        const aboutText = propertyAbout.replace(/\n/g, "<br />");

        console.log({contract})

        const response = await (contract!.connect(signer!) as Contract).addAsset!(propertyName, aboutText, propertyValue, 2,rentPerYear)


        console.log(response)
        setAdded(true)
    }

    if (added)  {
      return <div className='min-h-[60vh] flex flex-col items-center justify-center'>
      <h2 className='mb-4 text-3xl' >Asset added!</h2>

  </div>
    }

  return (
    <div className='mb-8 py-8 px-4 flex flex-col items-center'>
        <h2 className='text-3xl text-center mb-6 text-blue-400'>Add new asset</h2>

      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-4'>
          <label htmlFor='property-name' className='mb-2 block'>Property name</label>
          <input  id="property-name" className='w-full max-w-[300px] border px-4 py-2 rounded-lg mb-4' type="text" placeholder="Great Suites" onChange={handleNameChange} value={propertyName || ""} />

          <label htmlFor='property-value' className='mb-2 block'>Property value (BNB)</label>
          <input id="property-value" className='w-full max-w-[300px] border px-4 py-2 rounded-lg mb-4' type="number" placeholder="2.56" step="0.01" min="0" max={`${balance}`} onChange={handleValueChange} value={propertyValue || ""} />

          <label htmlFor='rent-per-year' className='mb-2 block'>Rentper year (BNB)</label>
          <input className='w-full max-w-[300px] border px-4 py-2 rounded-lg mb-4' type="number" placeholder="0.1" step="0.01" min="0"  onChange={handleRentChange} value={rentPerYear || ""} />

          <button onClick={handleAddAsset} className='p-4 px-8 rounded-full bg-black text-white text-sm mx-auto self-center'>Add Asset</button>
        </div>


        <div className='col-span-8'>
        <label htmlFor='property-about-text' className='mb-2 block'>Property Description</label>
        <textarea 
        className='w-full h-full  border px-4 py-2 rounded-lg mb-4'
        id="property-about-text" 
        placeholder={lorem} 
        onChange={handleAboutChange} 
        value={propertyAbout || ""}  />
        </div>
      </div>
       

       
        
       

        
    </div>
  )
}

export default CreateAsset