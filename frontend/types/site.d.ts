export type AssetType = {
    id: number;
    propertyName: string;
     propertyAbout: string;
    propertyValue: number;
    sharesAvailable: number;
    sharesSold: number;
    status: number;
    rentValuePerYear: number;
    startTime: number,
    endTime: number,
    rentee: string,
    paid: boolean,
}

export type SharesType = {
    walletAddress: string,
    assetId: number,
    propertyName: string,
    sharesValueInPercentage: number,
    sharesValueInBNB: number,
    locked: number,
    lockedTime: number,
}