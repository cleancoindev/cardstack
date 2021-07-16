import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import NetworkCorrection from '@cardstack/web-client/services/network-correction';
import { currentNetworkDisplayInfo as c } from '@cardstack/web-client/utils/web3-strategies/network-display-info';

export default class IncorrectNetworkOverlayComponent extends Component {
  @service declare networkCorrection: NetworkCorrection;

  get shouldShowOverlay() {
    return this.networkCorrection.needsReload;
  }

  get message() {
    return `You need to be on ${c.layer1.fullName} for Layer 1 and ${c.layer2.fullName} for Layer 2. Please change your networks or disconnect and we'll reload the page.`;
  }
}
