import React, {useContext} from 'react';
import Image from 'next/image'
import { Inter } from 'next/font/google'

import AppContext from '@/context/app-context';
import { ASSETS_DATA } from '@/config/test-data';

const inter = Inter({ subsets: ['latin'] })

import { useRouter } from 'next/router'
import Header from '@/components/layout/header';
import AssetView from '@/components/asset-view';



export default function Home() {
  const router = useRouter()
  

  

  return (
    <main
      className={`${inter.className}`}
    >
      <Header />
      <AssetView assetId={Number(router.query.id)}
      
      />
    </main>
  )
}
