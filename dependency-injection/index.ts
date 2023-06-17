
import { TOKENS } from './core/Tokens';
import { container } from './core/Container';

const counter = container.get(TOKENS.counter);

counter.increase() // -> State increased. Current state is 1.

console.log(counter);