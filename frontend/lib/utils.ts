export const formatAddress = (address: string) =>  {
    const formattedAddr = address.slice(0, 5) + "..." + address.slice(-4);

    return formattedAddr;

}
