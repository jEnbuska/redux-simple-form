import React from 'react';

export default function PasswordInput ({ active, mouseOver, changed, required, input, }) {
    return (<div className="input-wrapper">
        <span className={'input-container ' + (active ? ' input-active' : '')}>
            <label className={(mouseOver ? 'input-label-highlight' : 'input-label')} htmlFor={input.name}>{input.name}</label>
            <input {...input} className={active ? 'input-active' : changed ? 'input-changed' : ''} type="password"/>
            <p className={('input-warn' ) + (required && left && invalid && !active ? '-shown' : '')}>Fix content</p>
        </span>
    </div>);
}