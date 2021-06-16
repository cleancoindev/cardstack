import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { LogLevel } from '@orbit/coordinator';

export default class ApplicationRoute extends Route {
  @service dataCoordinator: any;

  async beforeModel(): Promise<void> {
    console.log('Orbit Sources:', this.dataCoordinator.sourceNames);
    let logLevel = LogLevel['Info'];

    await this.dataCoordinator.activate({ logLevel });
  }
}
