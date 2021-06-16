import { SyncStrategy } from '@orbit/coordinator';

export default {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  create() {
    return new SyncStrategy({
      name: 'remote-store-sync',

      source: 'remote',
      target: 'store',

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      catch(e) {
        // eslint-disable-next-line no-debugger
        debugger;
      },

      // filter(...args) {},

      blocking: true,
    });
  },
};
