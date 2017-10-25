import React from 'react';
import createForm from '../../../src/createForm';
import uuid from 'uuid/v4';
import NumberInput from 'components/NumberInput';
import TextInput from 'components/TextInput';
import RadioGroup from 'components/RadioGroup';
import PasswordInput from 'components/PasswordInput';
import Checkbox from 'components/Checkbox';
import Select from 'components/Select';
import CheckBox from 'components/Checkbox';
import './styles.scss';

const { values, entries, } = Object;

class MiscForm extends React.Component {

    render () {
        const { newTodo, todos, firstname, lastname, address, mood, password, gender, favoriteFood, } = this.props.form;
        return (
            <form className="form">
                {entries({ firstname, lastname, }).map(([ k, v, ]) => <TextInput required key={k}{...v}/>)}
                <div>
                    <h3>Address</h3>
                    {values(address).map(next => <TextInput required key={next.input.name} {...next}/>)}
                </div>
                <NumberInput {...mood} />
                <RadioGroup options={[ 'male', 'female', 'other', ]} group="gender" {...gender} />
                <PasswordInput {...password}/>
                <Select {...favoriteFood} options={[ 'Spaghetti', 'Pizza', 'Hamburger', ]}  onErrorMessage="Pick a better choice"/>
                <TextInput {...newTodo} />
                <button type="button" onClick={this.onCreateTodo}>Add Todo</button>
                {entries(todos).map(([ k, todo, ]) => (<div key={k}>
                    <TextInput {...todo.description}/>
                    <CheckBox {...todo.done}/>
                </div>))}
            </form>
        );
    }

    onCreateTodo = (e) => {
        e.preventDefault();
        const { newTodo: { input, }, todos: { actions, }, } = this.props.form;
        const { value, onChange, } = input;
        console.log(this.props.form.todos);
        const id = uuid();
        actions.onAssign({ [id]: { id, description: value, done: true, }, });
        onChange('');
        console.log(this.props.form.actions.getState());
    }
}

function notEmpty (str) {
    return !!str.length;
}
export default createForm({
    emptyState: {
        firstname: 'John',
        lastname: 'Doe',
        address: {
            street: '',
            zip: '',
            city: '',
        },
        mood: 10,
        password: '',
        gender: '',
        favoriteFood: 'Spaghetti',
        newTodo: '',
        todos: {},
    },
    format: {
        firstname: capitalize,
        lastname: capitalize,
        address: {
            street: capitalize,
            city: capitalize,
            zip: str => str.replace(/[^0-9.]/g, ''),
        },
        mood: numb => Math.min(10, Math.max(1, Number(numb))),
    },
    validate: {
        firstname: notEmpty,
        lastname: notEmpty,
        address: {
            street: notEmpty,
            zip: ({ length, }) => length===5,
            city: notEmpty,
        },
        password: pass => pass.length > 7,
        favoriteFood: str => str!=='Spaghetti',
    },
})(MiscForm);

function capitalize (str) {
    if (str) {
        return str[0].toUpperCase() + str.slice(1);
    }
    return str;
}