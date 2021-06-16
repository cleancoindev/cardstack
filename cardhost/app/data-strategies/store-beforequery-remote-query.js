import { RequestStrategy } from '@orbit/coordinator';

export default {
  create() {
    return new RequestStrategy({
      name: 'store-beforequery-remote-query',

      source: 'store',
      on: 'beforeQuery',

      target: 'remote',
      action: 'pull',

      catch(e) {
        console.warn('error performing remote.pull', e); // eslint-disable-line
        this.source.requestQueue.skip(e);
        this.target.requestQueue.skip(e);
      },

      /**
       * A filter function that returns `true` if the `action` should be performed.
       *
       * `filter` will be invoked in the context of this strategy (and thus will
       * have access to both `this.source` and `this.target`).
       */
      // filter(...args) {},

      /**
       * Should results returned from calling `action` on the `target` source be
       * passed as hint data back to the `source`?
       *
       * This can allow hints to inform the processing of subsequent actions on the
       * source. For instance, a `beforeQuery` event might invoke `query` on a
       * target, and those results could inform how the originating source performs
       * `_query`. This might allow a target source's sorting and filtering of
       * results to affect how the originating source processes the query.
       *
       * This setting is only effective for `blocking` strategies, since only in
       * those scenarios is processing delayed.
       */
      // passHints: true,

      /**
       * Should resolution of the target's `action` invocation block the
       * completion of the source's `on` event?
       *
       * Can be specified as a boolean or a function which which will be
       * invoked in the context of this strategy (and thus will have access to
       * both `this.source` and `this.target`).
       */
      blocking: true,
    });
  },
};
