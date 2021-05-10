import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import PriceOracle from '../contracts/abi/price-oracle';
import { getOracle } from '../contracts/addresses';
import BN from 'bn.js';

const tokenDecimals = new BN('18');
const ten = new BN('10');

export default class ExchangeRate {
  constructor(private layer2Web3: Web3) {}

  async getUSDPrice(token: string, amount: string): Promise<number> {
    let oracle = await this.getOracleContract(token);
    let usdRawRate = new BN((await oracle.methods.usdPrice().call()).price);
    let oracleDecimals = Number(await oracle.methods.decimals().call());
    let rawAmount = usdRawRate.mul(new BN(amount)).div(ten.pow(tokenDecimals));
    return safeFloatConvert(rawAmount, oracleDecimals);
  }

  async getETHPrice(token: string, amount: string): Promise<string> {
    let oracle = await this.getOracleContract(token);
    let ethRawRate = new BN((await oracle.methods.ethPrice().call()).price);
    let oracleDecimals = new BN(await oracle.methods.decimals().call());
    let weiAmount = ethRawRate.mul(new BN(amount)).div(ten.pow(oracleDecimals));
    return weiAmount.toString();
  }

  async getUpdatedAt(token: string): Promise<Date> {
    let oracle = await this.getOracleContract(token);
    let unixTime = Number((await oracle.methods.usdPrice().call()).updatedAt);
    return new Date(unixTime * 1000);
  }

  private async getOracleContract(token: string): Promise<Contract> {
    let address = await getOracle(token, this.layer2Web3);
    return new this.layer2Web3.eth.Contract(PriceOracle as AbiItem[], address);
  }
}

// because BN does not handle floating point, and the numbers from ethereum
// might be too large for JS to handle, we'll use string manipulation to move
// the decimal point. After this operation, the number should be safely in JS's
// territory.
function safeFloatConvert(rawAmount: BN, decimals: number): number {
  let amountStr = rawAmount.toString().padStart(decimals, '0');
  return Number(`${amountStr.slice(0, -1 * decimals)}.${amountStr.slice(-1 * decimals)}`);
}