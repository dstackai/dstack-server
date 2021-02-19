// @flow
import React, {useMemo} from 'react';
import cn from 'classnames';
import css from './styles.module.css';
import viewComponents from './views';
import type {TView} from './types';

export const VIEWS = Object.freeze({
    INPUT: 'InputView',
    SELECT: 'SelectView',
    SLIDER: 'SliderView',
    CHECKBOX: 'CheckboxView',
    APPLY: 'ApplyView',
    UPLOADER: 'UploaderView',
    OUTPUT: 'OutputView',
});

type Props = {
    className?: string,
    views?: Array<TView>,
    disabled?: boolean,
    onApplyClick: Function,
    onChange: (TView) => void,
}

const debounce = 300;

const Views = ({className, views, container = 'main', disabled, onApplyClick, onChange}: Props) => {
    const containerViews = useMemo(() => {
        return views.filter(v => (v.container === container || (!v.container && container === 'main')));
    }, [views]);

    const renderView = (view: TView) => {
        const View = viewComponents[view.type];

        return View
            ? <View
                view={view}
                {...{disabled, debounce, onApplyClick, onChange}}
            />
            : null;
    };

    if (!containerViews?.length)
        return null;

    console.log(container, containerViews);

    return (
        <div className={cn(css.views, css[container], className)}>
            {containerViews.map((viewItem: TView, index: number) => (
                <div
                    className={cn(css.cell, viewItem.type)}
                    key={index}
                    style={{
                        gridColumn: `span ${viewItem.colspan}`,
                        gridRow: `span ${viewItem.rowspan}`,
                    }}
                >
                    {renderView(viewItem)}
                </div>
            ))}
        </div>
    );
};

export default Views;