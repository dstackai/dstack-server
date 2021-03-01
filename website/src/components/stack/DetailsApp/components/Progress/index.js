// @flow
import React, {useState, useRef, useEffect, useMemo} from 'react';
import cn from 'classnames';
import usePrevious from 'hooks/usePrevious';
import css from './styles.module.css';

type Props = {
    progress?: number,
    className?: string,
    isActive?: boolean,
    size?: number,
    strokeWidth?: number,
}

const Progress = ({
    isActive = true,
    className,
    progress: propsProgress,
    size = 36,
    strokeWidth = 4,
}: Props) => {
    const [progress, setProgress] = useState(0);
    const step = useRef(0.01);
    const currentProgress = useRef(0);
    const prevIsActive = usePrevious(isActive);
    const requestFrame = useRef(null);
    const isActiveRef = useRef(false);

    const radius = useMemo(() => size / 2 - strokeWidth, [size, strokeWidth]);

    const strokeDasharray = useMemo(() => {
        return 2 * Math.PI * radius;
    }, [radius]);

    useEffect(() => {
        isActiveRef.current = isActive;

        if (isActive && typeof propsProgress !== 'number') {
            setProgress(0);
            step.current = 0.01;
            currentProgress.current = 0;
            startCalculateProgress();
        }

        if (prevIsActive === true && isActive === false) {
            setProgress(100);
            setTimeout(() => setProgress(0), 800);
        }

        if (isActive === null) {
            setProgress(0);
        }

        if (!isActive && requestFrame.current) {
            cancelAnimationFrame(requestFrame.current);
        }
    }, [isActive]);

    useEffect(() => {
        return () => {
            isActiveRef.current = false;
        };
    }, []);

    const calculateProgress = () => {
        currentProgress.current += step.current;
        const progress = Math.round(Math.atan(currentProgress.current) / (Math.PI / 2) * 100 * 1000) / 1000;

        setProgress(progress);

        if (progress > 70)
            step.current = 0.005;

        if (progress >= 100 || !isActiveRef.current)
            cancelAnimationFrame(requestFrame.current);

        if (isActiveRef.current)
            requestFrame.current = requestAnimationFrame(calculateProgress);
    };

    const startCalculateProgress = () => {
        setTimeout(() => {
            if (isActiveRef.current)
                requestAnimationFrame(calculateProgress);
        }, 1000);
    };

    const showProgress = typeof propsProgress === 'number' ? propsProgress : progress;

    const strokeDashoffset = strokeDasharray - strokeDasharray * showProgress / 100;

    return (
        <div className={cn(css.progress, className)}>
            <svg height={`${size}px`} width={`${size}px`}>
                <circle
                    className="bar"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />

                <circle
                    className="progress"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    style={{strokeDasharray, strokeDashoffset}}
                />
            </svg>

            <div className={css.percent}>
                {Math.floor(showProgress)}%
            </div>
        </div>
    );
};

export default Progress;
