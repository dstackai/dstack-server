// @flow
import React, {useMemo} from 'react';
import cn from 'classnames';
import {useWindowSize} from 'react-use';
import css from './styles.module.css';
import viewComponents from './views';
import type {TView} from './types';

export const VIEWS = Object.freeze({
    INPUT: 'InputView',
    SELECT: 'SelectView',
    SLIDER: 'SliderView',
    CHECKBOX: 'CheckboxView',
    UPLOADER: 'UploaderView',
    OUTPUT: 'OutputView',
});

const resolutionColumnsMap = {
    sidebar: [
        [0, 1],
        [769, 2],
    ],

    main: [
        [0, 2],
        [769, 6],
        [1281, 12],
    ],
};

const viewsClassNameMap = {
    [VIEWS.INPUT]: css.input,
    [VIEWS.SELECT]: css.select,
    [VIEWS.SLIDER]: css.slider,
    [VIEWS.CHECKBOX]: css.checkbox,
    [VIEWS.UPLOADER]: css.uploader,
    [VIEWS.OUTPUT]: css.output,
};

type Props = {
    className?: string,
    views?: Array<TView>,
    loading?: boolean,
    onChange: (TView) => void,
}

const debounce = 1000;

const Views = ({className, views, container = 'main', loading, onChange}: Props) => {
    const containerViews = useMemo(() => {
        return views.filter(v => (
            v.visible &&
            (v.container === container || (!v.container && container === 'main'))
        ));
    }, [views]);

    const {width: windowWidth} = useWindowSize();

    const getGridColumns = (view: TView) => {
        let {colspan} = view;

        const maxColumns = resolutionColumnsMap[container].reduce((result, resolution) => {
            if (resolution[0] < windowWidth)
                result = resolution[1];

            return result;
        }, 0);

        return `span ${Math.min(maxColumns, colspan)}`;
    };

    const renderView = (view: TView) => {
        const View = viewComponents[view.type];

        return View
            ? <View
                className={cn(css.view, viewsClassNameMap[view.type])}
                view={view}
                {...{disabled: loading, debounce, onChange}}
            />
            : null;
    };

    if (!containerViews?.length)
        return null;

    const rowGap = container === 'main' ? 20 : 16;

    return (
        <div className={cn(css.views, css[container], className)}>
            {containerViews.map((viewItem: TView, index: number) => (
                <div
                    className={cn(css.cell, viewsClassNameMap[viewItem.type])}
                    key={index}
                    style={{
                        gridColumn: getGridColumns(viewItem),
                        gridRow: `span ${viewItem.rowspan}`,
                        height: viewItem.type === VIEWS.OUTPUT
                            && `${50 * viewItem.rowspan + rowGap * (viewItem.rowspan - 1)}px`,
                    }}
                >
                    {renderView(viewItem)}
                </div>
            ))}
        </div>
    );
};

export default Views;