// @flow

export interface TView {
    id: string,
    container: 'sidebar' | 'main',
    type: string | 'OutputView',
    label?: ?string,
    enabled?: boolean,
    rowspan?: number,
    colspan?: number,
    [key: string]: any,
}