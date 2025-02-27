import metamaskLogo from '@cardstack/web-client/images/logos/metamask-logo.svg';
import walletConnectLogo from '@cardstack/web-client/images/logos/wallet-connect-logo.svg';

export type WalletProviderId = 'metamask' | 'wallet-connect';
export interface WalletProvider {
  id: WalletProviderId;
  name: string;
  logo: string;
}

const walletProviders: WalletProvider[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    logo: metamaskLogo,
  },
  {
    id: 'wallet-connect',
    name: 'WalletConnect',
    logo: walletConnectLogo,
  },
];

export default walletProviders;
