import { injected } from 'brandi';

import { TOKENS } from './Tokens';
import { Logger } from '../lib/Logger';

export class Counter {
  constructor(
    private logger: Logger,
  ) {}

  public state: number = 0;

  public increase(): void {
    this.state += 1;
    this.logger.log(`State increased. Current state is ${this.state}.`);
  }

  public decrease(): void {
    this.state -= 1;
    this.logger.log(`State decreased. Current state is ${this.state}.`);
  }
}

injected(Counter, TOKENS.logger);