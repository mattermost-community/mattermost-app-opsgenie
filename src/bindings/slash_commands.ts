import {AppBinding} from '../types';

import {createAlertBinding, getHelpBinding} from './bindings';
import {newCommandBindings} from '../utils/bindings';

export const getCommandBindings = (): AppBinding => {
    const bindings: AppBinding[] = [];

    bindings.push(getHelpBinding());
    bindings.push(createAlertBinding())
    return newCommandBindings(bindings);
};

