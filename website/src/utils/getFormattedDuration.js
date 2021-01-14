import moment from 'moment';

export default duration => {
    if (duration < 1000)
        return '0sec';

    let string = '';

    const momentDuration = moment.duration(duration);
    const hours = momentDuration.hours();
    const minutes = momentDuration.minutes();
    const seconds = momentDuration.seconds();

    if (hours)
        string += `${moment.duration(hours, 'hours').as('hours')}h`;

    if (minutes)
        string += ` ${moment.duration(minutes, 'minutes').as('minutes')}min`;

    if (seconds)
        string += ` ${moment.duration(seconds, 'seconds').asSeconds()}sec`;

    return string;
};