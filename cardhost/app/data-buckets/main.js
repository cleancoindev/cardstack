import BucketClass from '@orbit/indexeddb-bucket';

export default {
  create(injections = {}) {
    injections.name = 'main';
    injections.namespace =
      'cardhost-main';
    return new BucketClass(injections);
  }
};
