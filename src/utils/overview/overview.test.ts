import moment from 'moment';
import { ChartUnit } from '../../global/enums';
import { OVERVIEW_CHART_LIMIT } from '../../global/variables';
import { getMinDateByUnitOverview } from './overview';

describe('getMinDateByUnitOverview', () => {
    const now = new Date(2026, 6, 20, 20, 37, 42, 123);

    beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(now.valueOf());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('starts the weekly range at midnight without shifting it forward by one day', () => {
        const expected = moment(now)
            .subtract(OVERVIEW_CHART_LIMIT, 'weeks')
            .startOf('day')
            .toDate();

        expect(getMinDateByUnitOverview(ChartUnit.WEEK)).toEqual(expected);
    });

    it('starts the daily range at midnight', () => {
        const expected = moment(now)
            .subtract(OVERVIEW_CHART_LIMIT, 'days')
            .startOf('day')
            .toDate();

        expect(getMinDateByUnitOverview(ChartUnit.DAY)).toEqual(expected);
    });

    it('normalizes the default range to midnight', () => {
        const expected = moment(now)
            .subtract(OVERVIEW_CHART_LIMIT, 'weeks')
            .startOf('day')
            .toDate();

        expect(getMinDateByUnitOverview(ChartUnit.MONTH)).toEqual(expected);
    });
});
