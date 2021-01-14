const JOB_DEFAULT_ESTIMATED_DURATION = 600000;

export const calculateJobProgress = (job: {
    'estimated_duration'?: ?number,
    started: number,
}) => {
    const estimatedDuration = job['estimated_duration'] || JOB_DEFAULT_ESTIMATED_DURATION;
    const currentDuration = Date.now() - job.started;
    const leftDuration = estimatedDuration - currentDuration;
    const progress = Math.min(currentDuration / estimatedDuration * 100, 100).toFixed();

    return [progress, leftDuration];
};
