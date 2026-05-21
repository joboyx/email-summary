import { beforeEach } from '@jest/globals';
import { loadSource, resetSourceState } from './support/load-source';

loadSource();

beforeEach(() => {
  resetSourceState();
});
