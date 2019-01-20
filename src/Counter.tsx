import * as React from 'react';
import { Dispatch, Cmd, Reaction } from './mvu/mvu';
import { createAction, ActionType, getType } from 'typesafe-actions';
import { pure } from './mvu/react-mvu';

const messages = {
    increment : createAction('INCREMENT') ,
    decrement : createAction('DECREMENT'),
    clear: createAction('CLEAR')
};

export type Messages = ActionType<typeof messages>;

export interface Model { count: number };

const init = {
   count: 0 
};

const inc = async () => {
    function ts(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    console.log("IN ASYNC");
    await ts(2000);
    console.log("AFTER ASYNC");
    return messages.decrement();
}

const update = (state: Model, msg: Messages) : Reaction<Model, Messages>  => {
    switch(msg.type)
    {
        case getType(messages.increment): 
            console.log(`UPDATE: INCREMENT`);
            return [{ count: state.count + 1 }, Cmd.ofPromise(inc())];
        case getType(messages.decrement): 
            console.log(`UPDATE: DECREMENT`);
            return [{ count: state.count - 1 }, Cmd.none];
        case getType(messages.clear):
            return [{count: 100 }, Cmd.none]
        default:
            throw new Error("unknown message type"); 
    };
};

const view = (state: Model, dispatch: Dispatch<Messages>) => {
    return (
        <div>
            <button onClick = {() => dispatch(messages.increment())}>+</button>
            <span>{state.count}</span>
            <button onClick = {() => dispatch(messages.decrement())}>-</button>
            <button onClick = {() => dispatch(messages.clear())}>!</button>
        </div>
    );
};

export default {
    messages: messages,
    init: init,
    update : update,
    view: pure(view)
};
