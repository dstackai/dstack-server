import React from 'react';
import cn from 'classnames';
import ReactMarkdown from 'react-markdown';
import css from './styles.module.css';

const Markdown = ({className, children}) => {
    return (
        <div className={cn(className, css.markdown)}>
            <ReactMarkdown>
                {children}
            </ReactMarkdown>
        </div>
    );
};

export default Markdown;