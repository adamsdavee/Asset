import React, {useContext} from 'react';
import Image from 'next/image'
import { Inter } from 'next/font/google'

import AppContext from '@/context/app-context';

const inter = Inter({ subsets: ['latin'] })

import { useRouter } from 'next/router'
import Header from '@/components/layout/header';
import ShareView from '@/components/share-view';



export default function Home() {
  const router = useRouter()
  

  

  return (
    <main
      className={`${inter.className}`}
    >
      <Header />
      <ShareView assetId={Number(router.query.id)}
      
      />
    </main>
  )
}
