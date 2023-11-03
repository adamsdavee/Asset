import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import { ethers } from "ethers";
// const ethers = require("ethers")
// https://docs.ethers.org/v6/migrating/#migrate-providers

import Header from "@/components/layout/header";

import AppContext, { CONTRACT_OWNER } from "@/context/app-context";
import Assets from "@/components/Assets";
import NotConnected from "@/components/not-connected";
import DashboardMain from "@/components/account/dashboard-main";
import { formatAddress } from "@/lib/utils";
import CreateAsset from "@/components/account/create-asset";
import Deposit from "@/components/account/deposit";

export default function Home() {
  const appCtx = useContext(AppContext);
  const [openAddAsset, setOpenAddAsset] = useState(false);
  const [openDeposit, setOpenDeposit] = useState(false);

  const { connected, deposit, setup, getDeposit, signerAddress } = appCtx;

  const isContractCreator = CONTRACT_OWNER === signerAddress;

  const handleOpenAddAsset = () => {
    setOpenDeposit(false);
    setOpenAddAsset(true);
  };

  const handleOpenDeposit = () => {
    setOpenAddAsset(false);
    setOpenDeposit(true);
  };

  useEffect(() => {
    if (connected) {
      getDeposit();
    }
  }, [connected]);

  return (
    <main className={`${inter.className}`}>
      <Header />

      {connected ? (
        <>
          <div className="text-center  p-4 pt-8">
            {/* <div className='mb-6 mx-auto rounded-full w-12 h-12 bg-green-400 '></div> */}
            <div className="text-5xl mb-4" onClick={getDeposit}>
              {deposit || deposit.toFixed(2)} BNB
              {/* <span className='text-lg font-bold'>BSC</span> */}
            </div>

            <p className="mb-4 font-light text-sm">
              {formatAddress(signerAddress!)}
            </p>

            <div>
              <button
                onClick={handleOpenDeposit}
                className="p-4 px-8 rounded-full bg-black text-white"
              >
                {" "}
                Deposit
              </button>
              {isContractCreator && (
                <button
                  onClick={handleOpenAddAsset}
                  className="ml-4 p-4 px-8 rounded-full bg-black text-white "
                >
                  {" "}
                  New Asset
                </button>
              )}
            </div>
          </div>

          {openAddAsset && <CreateAsset />}
          {openDeposit && <Deposit />}
          <DashboardMain />
        </>
      ) : (
        <NotConnected />
      )}
    </main>
  );
}
