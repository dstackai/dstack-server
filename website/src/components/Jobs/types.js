export type Job = {
    id: string,
    title: string,
    code: string,
    runtime: string,
    schedule: string,
    status: 'RUNNING' | 'TIMEOUT' | 'FAILED' | 'FINISHED' | 'CREATED' | 'SCHEDULED' | 'STOPPING' | 'STOPPED',
    logs?: string,
}