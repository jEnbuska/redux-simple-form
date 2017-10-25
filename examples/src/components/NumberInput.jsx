import React from 'react';

export default function NumberInput ({ input, mouseOver, changed, active, required, left, invalid, }) {
    return (
        <div className="input-wrapper">
        <span className={'input-container ' + (active ? ' input-active' : '')}>
            <label className={(mouseOver ? 'input-label-highlight' : 'input-label')} htmlFor={input.name}>{input.name}</label>
            <input type='number' {...input} className={active ? 'input-active' : changed ? 'input-changed' : ''}/>
            <p className={('input-warn' ) + (required && left && invalid && !active ? '-shown' : '')}>Fix content</p>
        </span>
        </div>
    );
}
