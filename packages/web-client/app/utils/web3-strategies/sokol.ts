const BRIDGE = 'https://safe-walletconnect.gnosis.io/';
import CustomStorageWalletConnect from '../wc-connector';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';
import { reads } from 'macro-decorators';
import { tracked } from '@glimmer/tracking';
import { Layer2Web3Strategy } from './types';
import { IConnector } from '@walletconnect/types';
import WalletInfo from '../wallet-info';
import { defer } from 'rsvp';
import { BigNumber } from '@ethersproject/bignumber';

export default class SokolWeb3Strategy implements Layer2Web3Strategy {
  chainName = 'Sokol Testnet';
  chainId = 77;
  provider: any | undefined;

  @reads('provider.connector') connector!: IConnector;
  @tracked isConnected = false;
  @tracked walletConnectUri: string | undefined;
  @tracked walletInfo = new WalletInfo([], this.chainId) as WalletInfo;
  waitForAccountDeferred = defer();
  web3!: Web3;

  constructor() {
    // super(...arguments);
    this.initialize();
  }

  @tracked xdaiBalance: BigNumber | undefined;

  async initialize() {
    this.provider = new WalletConnectProvider({
      chainId: this.chainId,
      rpc: {
        77: 'https://sokol.poa.network',
      },
      connector: new CustomStorageWalletConnect(
        {
          bridge: BRIDGE,
        },
        this.chainId
      ),
    });
    this.connector.on('display_uri', (err, payload) => {
      if (err) {
        console.error('Error in display_uri callback', err);
        return;
      }
      this.walletConnectUri = payload.params[0];
    });
    await this.provider.enable();
    this.web3 = new Web3(this.provider as any);
    this.isConnected = true;
    // this.initializePayableToken();
    this.updateWalletInfo(this.connector.accounts, this.connector.chainId);
    this.connector.on('session_update', (error, payload) => {
      if (error) {
        throw error;
      }
      let { accounts, chainId } = payload.params[0];
      if (chainId !== this.chainId) {
        throw new Error(
          `Expected connection on ${this.chainName} (chain ID ${this.chainId}) but connected to chain ID ${chainId}`
        );
      }
      this.updateWalletInfo(accounts, chainId);
    });

    this.connector.on('disconnect', (error) => {
      if (error) {
        console.error('error disconnecting', error);
        throw error;
      }
      this.isConnected = false;
      this.clearWalletInfo();
      this.walletConnectUri = undefined;
      setTimeout(() => {
        this.initialize();
      }, 1000);
    });
  }

  updateWalletInfo(accounts: string[], chainId: number) {
    if (accounts.length) {
      this.waitForAccountDeferred.resolve();
    } else {
      this.waitForAccountDeferred = defer();
    }
    this.walletInfo = new WalletInfo(accounts, chainId);
  }

  clearWalletInfo() {
    this.updateWalletInfo([], this.chainId);
  }

  get waitForAccount() {
    return this.waitForAccountDeferred.promise;
  }
}