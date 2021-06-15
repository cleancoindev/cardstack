import { RequestStrategy } from '@orbit/coordinator';

export default {
  create() {
    return new RequestStrategy({
      name: 'store-beforeupdate-remote-update',

      source: 'store',
      on: 'beforeUpdate',

      target: 'remote',
      action: 'update',

      /**
       * A handler for any errors thrown as a result of performing the action.
       */
      catch(e, transform) {
        console.error('Error performing remote.update()', transform, e);
        this.source.requestQueue.skip(e);
        this.target.requestQueue.skip(e);
        throw e;
      },

      /**
       * A filter function that returns `true` if the `action` should be performed.
       *
       * `filter` will be invoked in the context of this strategy (and thus will
       * have access to both `this.source` and `this.target`).
       */
      // filter(...args) {},

      passHints: true,
      blocking: true,
    });
  },
};
