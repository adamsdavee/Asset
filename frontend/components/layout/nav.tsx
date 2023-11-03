import Link from 'next/link'
import React from 'react'
import { usePathname} from 'next/navigation'

const Nav = () => {
  const currentPage = usePathname()

  console.log({currentPage})

  return (
    <div>
      <ul className='flex items-center '>
      <Link href={"/"}>
        <li className={`border border-transparent hover:border-gray-300 px-1 text-sm sm:text-base sm:px-4 py-1 mr-2 ${(currentPage === "/") && "border-gray-300 underline"}`}>Home</li>
      </Link>
      <Link href={"/assets"}>
        <li className={`border border-transparent hover:"border-gray-300" px-1 text-sm sm:text-base sm:px-4 py-1 mr-2 ${(currentPage === "/assets") && "border-gray-300 underline"}`}>Assets</li>
      </Link>
   
        <Link href={"/account"}>
          <li className={`border border-transparent hover:border-gray-300 px-1 text-sm sm:text-base sm:px-4 py-1 ${(currentPage === "/account") && "border-gray-300 underline"}`}>Account</li>
        </Link>
        </ul>
    </div>
  )
}

export default Nav