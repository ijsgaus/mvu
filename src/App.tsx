import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Cmd, Dispatch, Reaction } from './mvu/mvu';
import { createReactApp } from './mvu/react-mvu';
import { createDevReactApp, withDevTools, useDevTools } from './mvu/mvu-devtools';
import Counter, { Messages as CounterMessages, Model as CounterModel  } from './Counter';
import { createAction, ActionType, getType } from 'typesafe-actions';

const messages = {
  addCounter : createAction("ADDCOUNT"), 
  cmdCounter : createAction("COUNTER_CMD", r => (id: string, action: CounterMessages) => r({ id, action}))
}

type MessagesType = ActionType<typeof messages>;

interface Model {
  lastid: number,
  counters: { [id:string] :CounterModel },
}

const init = {
  lastid : 0,
  counters : {}
};

const cmdCountersMap = (id: string) => (action: CounterMessages) => messages.cmdCounter(id, action);

const update = (model : Model, msg : MessagesType) : Reaction<Model, MessagesType> => {
  switch(msg.type)
  {
    case getType(messages.addCounter):
      return [
        { 
          lastid: model.lastid + 1,
          counters: {...model.counters, [`${model.lastid}`] : Counter.init }
        },
        Cmd.none
      ];
      
      case getType(messages.cmdCounter):
        const cnt = model.counters[msg.payload.id];
        let [newCnt, cmd] = Counter.update(cnt, msg.payload.action);
        return [{lastid : model.lastid, counters : { ...model.counters, [msg.payload.id] : newCnt }}, 
          Cmd.map(cmd, cmdCountersMap(msg.payload.id)) ]

      default:
          throw new Error();
  }
}

const view = (model : Model, dispatch : Dispatch<MessagesType>) => {
  let v = [];
  for(const p in model.counters) {
    v.push(<li key={p}> <Counter.view model = {model.counters[p]} dispatch={Dispatch.map(dispatch, cmdCountersMap(p))}/></li>)
  };

  return (
    <div>
      <ul>
        {v}
      </ul>
      <button type="submit" onClick={() => dispatch(messages.addCounter())}>Add</button>
    </div>
  );
}

const App = useDevTools(createReactApp([init, Cmd.none], update, view));

export default App;
