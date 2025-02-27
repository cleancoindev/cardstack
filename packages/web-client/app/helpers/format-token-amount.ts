import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import TextFormattingService from '../services/text-formatting';
import BN from 'bn.js';
import { fromWei } from 'web3-utils';

type FormatTokenAmountHelperParams = [BN, number];

class FormatTokenAmountHelper extends Helper {
  @service declare textFormatting: TextFormattingService;
  compute(
    [
      amountInSmallestUnit,
      minPrecision,
    ]: FormatTokenAmountHelperParams /*, hash*/
  ) {
    if (amountInSmallestUnit == null) {
      return null;
    }

    // fallback to the reasonable default of 2
    // assume that non-numbers and numbers < 0 are mistakes
    if (
      minPrecision === undefined ||
      minPrecision === null ||
      isNaN(minPrecision) ||
      minPrecision < 0
    ) {
      minPrecision = 2;
    }
    let result = fromWei(amountInSmallestUnit).toString();

    if (minPrecision === 0) {
      return result;
    }

    if (!result.includes('.')) {
      result += '.';
      result = result.padEnd(minPrecision + result.length, '0');
    } else {
      let floatingDecimals = result.split('.')[1]?.length;
      if (floatingDecimals < minPrecision) {
        let difference = minPrecision - floatingDecimals;
        result = result.padEnd(difference + result.length, '0');
      }
    }

    return result;
  }
}

export default FormatTokenAmountHelper;
