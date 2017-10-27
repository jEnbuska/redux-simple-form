import React from 'react';

export default function CheckBox({ input, active, mouseOver, changed, }) {
    return (
        <div className="input-wrapper">
            <span className={`input-container ${active ? ' input-active' : ''}`}>
                <label className={(mouseOver ? 'input-label-highlight' : 'input-label')} htmlFor={input.name}>{input.name}</label>
                <input {...input} className={(active ? 'input-active' : (changed ? 'input-changed' : ''))} type="checkbox"/>
            </span>
        </div>
    );
}