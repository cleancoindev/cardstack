/* eslint @typescript-eslint/naming-convention: "off" */

import { ContractMeta } from '../version-resolver';

import v0_6_3 from './v0.6.3';

export { RewardTokenBalance } from './base';

// add more versions as we go, but also please do drop version that we don't
// want to maintain simultaneously
export type RewardPool = v0_6_3;

export const rewardPoolMeta = {
  apiVersions: { v0_6_3 },
  contractName: 'rewardPool',
} as ContractMeta;
