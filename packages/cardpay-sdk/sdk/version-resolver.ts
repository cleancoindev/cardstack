import Web3 from 'web3';
import { getAddress } from '../contracts/addresses';
import { AbiItem } from 'web3-utils';
import { satisfies } from 'semver';
import mapKeys from 'lodash/mapKeys';
import { ExchangeRate, exchangeRateMeta } from './exchange-rate';
import { Safes, safesMeta } from './safes';
import { PrepaidCard, prepaidCardMeta } from './prepaid-card';
import Assets from './assets';
import TokenBridgeHomeSide from './token-bridge-home-side';
import TokenBridgeForeignSide from './token-bridge-foreign-side';
import { revenuePoolMeta, RevenuePool } from './revenue-pool';
import { rewardPoolMeta, RewardPool } from './reward-pool';
import HubAuth from './hub-auth';

type SDK =
  | 'Assets'
  | 'ExchangeRate'
  | 'PrepaidCard'
  | 'RevenuePool'
  | 'Safes'
  | 'HubAuth'
  | 'TokenBridgeHomeSide'
  | 'TokenBridgeForeignSide'
  | 'RewardPool';
export interface ContractMeta {
  apiVersions: Record<string, any>;
  contractName: string;
}

const cardPayVersionABI: AbiItem[] = [
  {
    constant: true,
    inputs: [],
    name: 'cardpayVersion',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'pure',
    type: 'function',
  },
];

export async function getSDK(sdk: 'Assets', web3: Web3): Promise<Assets>;
export async function getSDK(sdk: 'HubAuth', web3: Web3, hubRootUrl: string): Promise<HubAuth>;
export async function getSDK(sdk: 'ExchangeRate', web3: Web3): Promise<ExchangeRate>;
export async function getSDK(sdk: 'PrepaidCard', web3: Web3): Promise<PrepaidCard>;
export async function getSDK(sdk: 'RevenuePool', web3: Web3): Promise<RevenuePool>;
export async function getSDK(sdk: 'RewardPool', web3: Web3): Promise<RewardPool>;
export async function getSDK(sdk: 'Safes', web3: Web3): Promise<Safes>;
export async function getSDK(sdk: 'TokenBridgeHomeSide', web3: Web3): Promise<TokenBridgeHomeSide>;
export async function getSDK(sdk: 'TokenBridgeForeignSide', web3: Web3): Promise<TokenBridgeForeignSide>;
export async function getSDK(sdk: SDK, ...args: any[]): Promise<any> {
  let [web3] = args;
  let apiClass;
  switch (sdk) {
    case 'Assets':
      apiClass = Assets;
      break;
    case 'HubAuth':
      apiClass = HubAuth;
      break;
    case 'ExchangeRate':
      apiClass = await resolveApiVersion(exchangeRateMeta, web3);
      break;
    case 'PrepaidCard':
      apiClass = await resolveApiVersion(prepaidCardMeta, web3);
      break;
    case 'RevenuePool':
      apiClass = await resolveApiVersion(revenuePoolMeta, web3);
      break;
    case 'RewardPool':
      apiClass = await resolveApiVersion(rewardPoolMeta, web3);
      break;
    case 'Safes':
      apiClass = await resolveApiVersion(safesMeta, web3);
      break;
    case 'TokenBridgeForeignSide':
      apiClass = TokenBridgeForeignSide;
      break;
    case 'TokenBridgeHomeSide':
      apiClass = TokenBridgeHomeSide;
      break;
    default:
      assertNever(sdk);
  }
  return new apiClass(...args);
}

async function resolveApiVersion(meta: ContractMeta, web3: Web3) {
  let contract = new web3.eth.Contract(cardPayVersionABI, await getAddress(meta.contractName, web3));
  let protocolVersion = await contract.methods.cardpayVersion().call();
  let versionMap = mapKeys(meta.apiVersions, (_, key) => key.replace('v', '').replace(/_/g, '.'));
  let apiClass = getAPIVersion(versionMap, protocolVersion);
  return apiClass;
}

interface APIVersionMap<T> {
  [version: string]: T;
}

function getAPIVersion<T>(apiVersionMap: APIVersionMap<T>, protocolVersion: string): T {
  let availableApiVersions = Object.keys(apiVersionMap).sort().reverse();
  let satisfyingApiVersion: string | undefined;
  for (let possibleApiVersion of availableApiVersions) {
    // we'll use the ~ Tilde Range comparator which will permit patch version
    // for previous patches with the same minor, but not permit previous minors.
    // This means that we need an explicit API version for all minor versions of
    // the cardpay protocol. For patch versions, it's up to use if we want a
    // specific API version for a patch, otherwise the previous most recent
    // patch version of the API will be used. This will allow us to build API's
    // for not yet deployed contracts, where the SDK will switch to the future
    // version of the API as soon as the on-chain protocol version updates.
    // https://www.npmjs.com/package/semver
    if (satisfies(protocolVersion, `~${possibleApiVersion}`)) {
      satisfyingApiVersion = possibleApiVersion;
      break;
    }
  }

  if (!satisfyingApiVersion) {
    throw new Error(
      `Could not find a version of the API that satisfies cardpay protocol version ${protocolVersion} for PrepaidCard`
    );
  }

  return apiVersionMap[satisfyingApiVersion];
}

function assertNever(_value: never): never {
  throw new Error(`not never`);
}
