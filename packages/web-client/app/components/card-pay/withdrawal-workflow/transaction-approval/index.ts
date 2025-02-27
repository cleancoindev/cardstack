import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { reads } from 'macro-decorators';
import { toBN } from 'web3-utils';
import Layer2Network from '@cardstack/web-client/services/layer2-network';
import {
  bridgedSymbols,
  BridgedTokenSymbol,
  ConvertibleSymbol,
  getUnbridgedSymbol,
  TokenDisplayInfo,
  TokenSymbol,
} from '@cardstack/web-client/utils/token';
import { WorkflowCardComponentArgs } from '@cardstack/web-client/models/workflow/workflow-card';

class CardPayWithdrawalWorkflowChooseBalanceComponent extends Component<WorkflowCardComponentArgs> {
  defaultTokenSymbol: TokenSymbol = 'DAI.CPXD';
  cardTokenSymbol: TokenSymbol = 'CARD.CPXD';
  @service declare layer2Network: Layer2Network;
  @reads('args.workflowSession.state.withdrawalToken')
  declare tokenSymbol: TokenSymbol;
  @tracked isConfirmed = false;

  get withdrawalToken() {
    return new TokenDisplayInfo(this.tokenSymbol);
  }

  get convertibleSymbol(): ConvertibleSymbol {
    if (this.tokenSymbol === this.cardTokenSymbol) {
      return 'CARD';
    } else {
      return 'DAI';
    }
  }

  get tokenBalance() {
    if (this.tokenSymbol === this.defaultTokenSymbol) {
      return this.layer2Network.defaultTokenBalance ?? toBN('0');
    } else if (this.tokenSymbol === this.cardTokenSymbol) {
      return this.layer2Network.cardBalance ?? toBN('0');
    }
    return toBN('0');
  }

  get withdrawalAmount() {
    return toBN(this.args.workflowSession.state.withdrawnAmount);
  }

  get depotAddress() {
    return this.layer2Network.depotSafe?.address || undefined;
  }

  get isDisabled() {
    return (
      !this.depotAddress ||
      !this.withdrawalAmount ||
      this.withdrawalAmount.isZero() ||
      this.isConfirmed
    );
  }

  get state() {
    if (this.args.isComplete) {
      return 'memorialized';
    } else if (this.isConfirmed) {
      return 'in-progress';
    } else {
      return 'default';
    }
  }

  @action async save() {
    if (this.isDisabled) {
      return;
    }
    this.isConfirmed = true;
    let { tokenSymbol } = this;
    assertBridgedTokenSymbol(tokenSymbol);
    let transactionHash = await this.layer2Network.bridgeToLayer1(
      this.depotAddress!,
      getUnbridgedSymbol(tokenSymbol),
      this.withdrawalAmount.toString()
    );
    let layer2BlockHeight = await this.layer2Network.getBlockHeight();

    this.args.workflowSession.updateMany({
      layer2BlockHeightBeforeBridging: layer2BlockHeight,
      relayTokensTxnHash: transactionHash,
    });

    this.args.onComplete?.();
  }
}

export default CardPayWithdrawalWorkflowChooseBalanceComponent;

function assertBridgedTokenSymbol(
  token: TokenSymbol
): asserts token is BridgedTokenSymbol {
  if (!bridgedSymbols.includes(token as BridgedTokenSymbol)) {
    throw new Error(`${token} is not a bridged token`);
  }
}
