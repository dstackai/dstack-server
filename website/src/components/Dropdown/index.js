// @flow
import React, {useState, useEffect, useRef, forwardRef} from 'react';
import cx from 'classnames';
import RcTooltip from 'rc-tooltip';
import css from './styles.module.css';

type Item = {
    title: string,
    onClick?: Function,
}

type Props = {
    placement?: 'bottomLeft' | 'bottomRight',
    children?: Function,
    className?: string,
    buttonClassName?: string,
    items: Array<Item>,
} | {
    placement?: 'bottomLeft' | 'bottomRight',
    children?: Function,
    className?: string,
    buttonClassName?: string,
    items: Array<{[key: string]: any}>,
    renderItem: Function,
}

const Dropdown = forwardRef((
    {className, buttonClassName, children, renderItem: propRenderItem, items, placement = 'bottomRight'}: Props,
    ref
):Props => {
    const [isShow, setIsShow] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        document.body.addEventListener('click', outlineClickHandle);
        return () => document.body.removeEventListener('click', outlineClickHandle);
    });

    const outlineClickHandle = (event: SyntheticEvent<HTMLBodyElement>) => {
        let targetElement = event.target;

        do {
            if (targetElement === buttonRef.current || targetElement === dropdownRef.current)
                return;

            targetElement = targetElement.parentNode;
        } while (targetElement);

        if (isShow)
            setIsShow(false);
    };

    const onCLickButton = (event: SyntheticEvent<HTMLButtonElement>) => {
        clickStopPropagation(event);
        setIsShow(!isShow);
    };

    const clickStopPropagation = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();
    };

    const onCLickItem = (item: Item) => () => {
        setIsShow(!isShow);

        if (item.onClick)
            item.onClick();
    };

    const renderItem = (item, index: number) => {
        if (propRenderItem)
            return propRenderItem(item);

        return (
            <div
                key={index}
                className={css.item}
                onClick={onCLickItem(item)}
            >
                {item.title}
            </div>
        ) ;
    };

    return (
        <div
            ref={ref}
            className={cx(css.dropdown, className, {active: isShow})}
        >
            <RcTooltip
                arrowContent={null}
                visible={isShow}
                placement={placement}
                destroyTooltipOnHide
                align={{offset: [0, 0]}}

                overlay={
                    <div
                        className={cx(css.menu, 'show')}
                        ref={dropdownRef}
                        onClick={clickStopPropagation}
                    >
                        {items.map(renderItem)}
                    </div>
                }
            >
                {children
                    ? React.cloneElement(children, {
                        onClick: onCLickButton,
                        ref: buttonRef,
                    })
                    : <div ref={buttonRef} className={cx(css.button, buttonClassName)} onClick={onCLickButton}>
                        <span className="mdi mdi-dots-vertical" />
                    </div>
                }
            </RcTooltip>
        </div>
    );
});

export default Dropdown;
