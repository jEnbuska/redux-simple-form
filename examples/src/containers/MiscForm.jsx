import React from 'react';
import {connect} from 'react-redux';
import uuid from 'uuid/v4';
import Button from 'components/Button';
import NumberInput from 'components/NumberInput';
import TextInput from 'components/TextInput';
import RadioGroup from 'components/RadioGroup';
import PasswordInput from 'components/PasswordInput';
import Checkbox from 'components/Checkbox';
import Select from 'components/Select';
import createForm from '../../../src/createForm';
import {select, text, checkbox, radio, password, email, number, tel, } from '../../../src/DefinitionBuilder';
import './styles.scss';

const { values, entries, } = Object;

class MiscForm extends React.Component {
    render() {
        const { newTodo, todos, firstname, lastname, address, mood, password, gender, favoriteFood, } = this.props.form;
        return (
            <form className="form">
                <div>
                    <h3>Name</h3>
                    {entries({ firstname, lastname, }).map(([k, v, ]) => <TextInput key={k}{...v}/>)}
                </div>
                <div>
                    <h3>Address</h3>
                    {values(address).map(next => <TextInput required key={next.input.name} {...next}/>)}
                </div>
                <NumberInput {...mood} />
                <RadioGroup options={['male', 'female', 'other', ]} group="gender" {...gender} />
                <PasswordInput {...password}/>
                <Select
                  {...favoriteFood}
                  options={['Spaghetti', 'Pizza', 'Hamburger',]}
                  onErrorMessage="Pick a better choice"/>
                <TextInput {...newTodo} />
                <button type="button" onClick={this.onCreateTodo}>Add Todo</button>
                {entries(todos).map(([k, todo, ]) => (<div key={k}>
                    <TextInput {...todo.description}/>
                    <CheckBox {...todo.done}/>
                    <Button text="Remove" onClick={() => todos.actions.onRemove(k)}/>
                </div>))}
            </form>
        );
    }

    onCreateTodo = (e) => {
        e.preventDefault();
        const { newTodo: { input, }, todos: { actions, }, } = this.props.form;
        const { value, onChange, } = input;
        if (value) {
            onChange('');
            const id = uuid();
            console.log({ id });
            actions.onAssign({ [id]: { id, description: value, done: false, }, });
        }
    };
}

export default connect(state => state)(createForm({
    initialState: ({ user }) => user,
    shape: {
        firstname: text.autoFocus.required.format(capitalize).validate(notEmpty),
        lastname: text.required.format(capitalize).validate(notEmpty),
        address: {
            street: text.required.format(capitalize).validate(notEmpty),
            zip: text.required.format(str => str.replace(/[^0-9.]/g, '')).validate(str => str.length === 5),
            city: text.required.format(capitalize).validate(notEmpty),
        },
        mood: number.min(1).max(10),
        password: password.required.validate(pass => pass.length >= 7),
        gender: radio.value('male'),
        favoriteFood: select.value('Pizza').validate(str => str !== 'Spaghetti'),
        newTodo: text,
        todos: [
            { description: text.validate(notEmpty), done: checkbox, },
        ],
    }
})(MiscForm));

function capitalize(str) {
    if (str) {
        return str[0].toUpperCase() + str.slice(1);
    }
    return str;
}

function notEmpty(str) {
    return !!str.length;
}