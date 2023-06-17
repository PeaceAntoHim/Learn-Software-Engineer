import { token } from 'brandi';

import { Logger } from '../lib/Logger';
import { Counter } from './Counter';

export const TOKENS = {
  logger: token<Logger>('logger'),
  counter: token<Counter>('counter'),
}; 