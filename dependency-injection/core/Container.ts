import { Container } from 'brandi';

import { TOKENS } from './Tokens';
import { ConsoleLogger } from '../lib/ConsoleLogger';
import { Counter } from './Counter';

export const container = new Container();

container
  .bind(TOKENS.logger)
  .toInstance(ConsoleLogger)
  .inTransientScope();

container
  .bind(TOKENS.counter)
  .toInstance(Counter)
  .inTransientScope();