import {AppBinding, AppsState} from '../types';

import {createAlertBinding, getHelpBinding} from './bindings';
import {newCommandBindings} from '../utils/bindings';

export const getCommandBindings = (): AppsState => {
    const bindings: AppBinding[] = [];

    bindings.push(getHelpBinding());
    bindings.push(createAlertBinding());
    return newCommandBindings(bindings);
};

