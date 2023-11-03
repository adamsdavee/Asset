import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image'
import { Inter } from 'next/font/google'


const inter = Inter({ subsets: ['latin'] })

import {ethers,} from 'ethers';
// const ethers = require("ethers")
// https://docs.ethers.org/v6/migrating/#migrate-providers

import Header from '@/components/layout/header';

import AppContext from '@/context/app-context';
import Assets from '@/components/Assets';
import NotConnected from '@/components/not-connected';




export default function Home() {
  const appCtx = useContext(AppContext)
  
  const { connected, getAssets, assets } = appCtx


  useEffect(() => {
    if (connected) {
      getAssets()
    }
  }, [connected])

  return (
    <main
      className={`${inter.className}`}
    >
      <Header />
      <div>
      {connected ? <Assets assets={assets}/> : <NotConnected />}
     
      </div>
      
    </main>
  )
}
