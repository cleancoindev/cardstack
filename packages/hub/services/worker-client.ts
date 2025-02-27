import config from 'config';
import { Job, TaskSpec, WorkerUtils, makeWorkerUtils } from 'graphile-worker';

export default class WorkerClient {
  private workerUtils: WorkerUtils | undefined;

  private get dbConfig() {
    return config.get('db') as Record<string, any>;
  }

  async addJob(identifier: string, payload?: any, spec?: TaskSpec): Promise<Job> {
    if (this.workerUtils) {
      return this.workerUtils.addJob(identifier, payload, spec);
    } else {
      throw new Error('Cannot call addJob before workerUtils is ready');
    }
  }

  async ready() {
    this.workerUtils = await makeWorkerUtils({
      connectionString: this.dbConfig.url,
    });
  }

  async teardown() {
    await this.workerUtils?.release();
  }
}

declare module '@cardstack/hub/di/dependency-injection' {
  interface KnownServices {
    'worker-client': WorkerClient;
  }
}
