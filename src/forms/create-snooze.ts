import {addHours, addMinutes, addDays} from 'date-fns';
import {
    AppCallAction,
    CloseAlertAction
} from '../types';
import {
    option_time_10m,
    option_time_15m,
    option_time_1d,
    option_time_1h,
    option_time_2h,
    option_time_30m,
    option_time_5m,
    option_time_6h
} from '../constant';

export async function newCreateSnoozeAlertCall(call: AppCallAction<CloseAlertAction>): Promise<void> {
    const selectedOption: string|undefined = call.context.selected_option;

    const currentDate: Date = new Date();
    const date: { [key: string]: Date } = {
        [option_time_5m]: addMinutes(currentDate, 5),
        [option_time_10m]: addMinutes(currentDate, 10),
        [option_time_15m]: addMinutes(currentDate, 15),
        [option_time_30m]: addMinutes(currentDate, 30),
        [option_time_1h]: addHours(currentDate, 1),
        [option_time_2h]: addHours(currentDate, 2),
        [option_time_6h]: addHours(currentDate, 6),
        [option_time_1d]: addDays(currentDate, 1),
    };

    console.log('endTime', date[<string>selectedOption].toString());
}
