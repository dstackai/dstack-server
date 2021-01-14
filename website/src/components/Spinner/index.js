// @flow
import React from 'react';
import cx from 'classnames';
import css from './styles.module.css';

const COLORS = {
    white: '#fff',
    blue: '#507CD0',
};

type Props = {
    align?: 'center',
    size?: number,
    color?: 'white' | 'blue',
    isShown?: boolean,
    className?: string,
};

const Spinner = ({size = 22, color = 'white', isShown, className, align}: Props) => {
    return (
        <div className={cx(css.spinner, className, align, {show: isShown})}>
            <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* eslint-disable */}
                <path
                    d="M11.7046 18.9689C13.3618 18.8224 14.9321 18.1628 16.1969 17.0821C17.4617 16.0014 18.3581 14.5532 18.7614 12.9392C19.1647 11.3252 19.0548 9.62557 18.4469 8.07695C17.839 6.52832 16.7635 5.20773 15.37 4.29897C13.9765 3.39021 12.3343 2.9385 10.672 3.00671C9.00979 3.07491 7.41015 3.65964 6.09577 4.67951C4.78139 5.69938 3.81766 7.10365 3.33871 8.69687C2.85976 10.2901 2.88943 11.993 3.42358 13.5686L5.19569 12.9678C4.78648 11.7607 4.76375 10.4561 5.13067 9.23556C5.4976 8.01499 6.23591 6.93918 7.24286 6.15785C8.24981 5.37653 9.4753 4.92857 10.7488 4.87632C12.0222 4.82406 13.2803 5.17012 14.3478 5.86632C15.4154 6.56253 16.2394 7.57423 16.7051 8.76064C17.1708 9.94704 17.255 11.2491 16.946 12.4856C16.6371 13.7221 15.9503 14.8316 14.9814 15.6595C14.0124 16.4875 12.8094 16.9927 11.5398 17.105L11.7046 18.9689Z"
                    fill="url(#paint0_linear)"
                />
                {/* eslint-enable */}

                <defs>
                    <linearGradient id="paint0_linear" x1="13.5" y1="18" x2="4" y2="13" gradientUnits="userSpaceOnUse">
                        <stop stopColor={COLORS[color]} />
                        <stop offset="1" stopColor={COLORS[color]} stopOpacity="0.2"/>
                    </linearGradient>
                </defs>
            </svg>

        </div>
    );
};

export default Spinner;
