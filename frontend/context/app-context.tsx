import React, { useState, useEffect, createContext, ReactNode } from "react";
import contractArtifact from "@/config/utils/AssetBloc.json";
import { ethers } from "ethers";
import { ASSETS_DATA, SHARES_DATA } from "@/config/test-data";
import { AssetType, SharesType } from "@/types/site";
import { Contract } from "ethers";

const CONTRACT_ADDRESS = "0x35eBcBE067d77915C27476ff24ab779B8fC3025e";
const contractABI = contractArtifact.abi;
export const CONTRACT_OWNER = "0x7476deB582C24610511D16266E972DF5d2895bc7";

type AppContextType = {
  connected: boolean;
  signerAddress: string | undefined;
  balance: number;
  deposit: number;
  assets: AssetType[];
  shares: SharesType[];
  contract: ethers.Contract | undefined;
  signer: ethers.JsonRpcSigner | undefined;
  setup: () => void;
  getAssets: () => void;
  getShares: () => void;
  getDeposit: () => void;
};

export const AppContext = createContext<AppContextType>({
  connected: false,
  signerAddress: "",
  balance: 0,
  deposit: 0,
  getDeposit: () => {},
  assets: [],
  shares: [],
  contract: undefined,
  signer: undefined,
  setup: () => {},
  getAssets: () => {},
  getShares: () => {},
});

export const bigIntToString = (val: bigint) => {
  return ethers.formatEther(val);
};

export const toWei = (val: string) => {
  return ethers.parseEther(val);
};

interface AppProviderPropTypes {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: AppProviderPropTypes) => {
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>(
    undefined
  );
  // const [provider, setProvider] = useState<ethers.JsonRpcProvider| undefined>(undefined);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | undefined>(
    undefined
  );
  const [contract, setContract] = useState<ethers.Contract | undefined>(
    undefined
  );
  const [signerAddress, setSignerAddress] = useState<string | undefined>(
    undefined
  );
  const [balance, setBalance] = useState(0);
  const [deposit, setDeposit] = useState(0);

  const [assets, setAssets] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);

  const setup = async () => {
    if (
      typeof window !== "undefined" &&
      typeof (window as any).ethereum !== "undefined"
    ) {
      const provider: ethers.BrowserProvider = new ethers.BrowserProvider(
        window.ethereum!
      );
      // const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider()
      setProvider(provider);

      await provider.send("eth_requestAccounts", []);

      if (provider !== undefined) {
        const signer = await provider.getSigner();
        setSigner(signer);
        console.log({ signer });

        const address = await signer.getAddress();
        setSignerAddress(address);
        console.log({ address });

        const balance = await provider.getBalance(address);
        setBalance(Number(bigIntToString(balance)));

        const mainContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          signer
        );
        console.log({ mainContract });
        setContract(mainContract);

        setConnected(true);
      }
    }
  };

  const getDeposit = async () => {
    const deposit = await (
      contract!.connect(signer!) as Contract
    ).getUserBalance();
    setDeposit(Number(bigIntToString(deposit)));
  };

  useEffect(() => {
    if (!connected) {
      setup();
    }

    if (connected) {
      // getDeposit()
    }
  }, [connected]);

  const getAssets = async () => {
    if (!connected) {
      return;
    }

    let assets = await (contract!.connect(signer!) as Contract).getAllAssets();
    setAssets(ASSETS_DATA);

    // assets.map((asset: AssetType )=> {
    //   id: asset.id,
    //   propertyName: asset.propertyName,
    //   propertyAbout: asset.propertyAbout,
    //   propertyValue: asset.propertyValue,
    //   sharesAvailable: asset.sharesAvailable,
    //   sharesSold: asset.sharesSold,
    //   status: asset.status,
    //   rentValuePerYear: asset.rentValuePerYear,
    //   startTime: asset.startTime,
    //   endTime: asset.endTime,
    //   rentee: asset.rentee,
    //   paid: asset.paid,
    // })

    console.log({ assets });

    // setAssets(assets)
  };

  const getShares = () => {
    setShares(SHARES_DATA);
  };

  return (
    <AppContext.Provider
      value={{
        connected,
        signerAddress,
        balance,
        deposit,
        assets: assets,
        shares: shares,
        contract: contract,
        signer: signer,
        setup: setup,
        getAssets,
        getShares,
        getDeposit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
