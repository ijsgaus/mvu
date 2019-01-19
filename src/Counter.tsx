import * as React from 'react';
import { Dispatch, Cmd, Reaction } from './mvu/mvu';
import { createAction, ActionType, getType } from 'typesafe-actions';


const increment = createAction('INCREMENT'); 
const decrement = createAction('DECREMENT');
const actions = {
    increment,
    decrement
};

export type ActionsType = ActionType<typeof actions>;

interface State { count: number };

export const init = () : State => {
    return { count: 0 };
};

const inc = async () => {
    function ts(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    console.log("IN ASYNC");
    await ts(2000);
    console.log("AFTER ASYNC");
    return decrement();
}

export const update = (state: State, msg: ActionsType) : Reaction<State, ActionsType>  => {
    switch(msg.type)
    {
        case getType(increment): 
            console.log(`UPDATE: INCREMENT`);
            return [{ count: state.count + 1 }, Cmd.ofPromise(inc())];
        case getType(decrement): 
            console.log(`UPDATE: DECREMENT`);
            return [{ count: state.count - 1 }, Cmd.none];
        default:
            throw new Error("unknown message type"); 
    };
};

export const view = (state: State, dispatch: Dispatch<ActionsType>) => {
    return (
        <div>
            <button onClick = {() => dispatch(increment())}>+</button>
            <span>{state.count}</span>
            <button onClick = {() => dispatch(decrement())}>-</button>
        </div>
    );
};

