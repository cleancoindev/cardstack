import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service dataCoordinator: any;

  async beforeModel(): Promise<void> {
    console.log('Orbit Sources:', this.dataCoordinator.sourceNames);

    await this.dataCoordinator.activate();
  }
}
