/// <reference types="next" />
/// <reference types="next/image-types/global" />

import { ExternalProvider } from "@ethersproject/providers";

declare global {
  interface Window {
    ethereum?: ExternalProvider;
  }
}

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
