import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Cmd, Dispatch, Reaction } from './mvu/mvu';
import { createReactApp, pure } from './mvu/react-mvu';
import * as Counter from './Counter';
import { createAction, ActionType, getType } from 'typesafe-actions';

const addCounter = createAction("ADDCOUNT");
const cmdCounter = createAction("COUNTER_CMD", r => (id: string, action: Counter.ActionsType) => r({ id, action}));

const message = {
  addCounter, cmdCounter
}

type MessagesType = ActionType<typeof message>;

interface Model {
  lastid: number,
  counters: { [id:string] :Counter.State },
}

const init = {
  lastid : 0,
  counters : {}
};

const cmdCountersMap = (id: string) => (action: Counter.ActionsType) => cmdCounter(id, action);

const update = (model : Model, msg : MessagesType) : Reaction<Model, MessagesType> => {
  switch(msg.type)
  {
    case getType(addCounter):
      return [
        { 
          lastid: model.lastid + 1,
          counters: {...model.counters, [`${model.lastid}`] : Counter.init() }
        },
        Cmd.none
      ];
      
      case getType(cmdCounter):
        const cnt = model.counters[msg.payload.id];
        let [newCnt, cmd] = Counter.update(cnt, msg.payload.action);
        return [{lastid : model.lastid, counters : { ...model.counters, [msg.payload.id] : newCnt }}, 
          Cmd.map(cmd, cmdCountersMap(msg.payload.id)) ]

      default:
          throw new Error();
  }
}

const Cnt = pure(Counter.view);



const view = (model : Model, dispatch : Dispatch<MessagesType>) => {
  let v = [];
  for(const p in model.counters) {
    v.push(<li key={p}> <Cnt model = {model.counters[p]} dispatch={Dispatch.map(dispatch, cmdCountersMap(p))}/></li>)
  };

  return (
    <div>
      <ul>
        {v}
      </ul>
      <button type="submit" onClick={() => dispatch(addCounter())}>Add</button>
    </div>
  );
}

const App = createReactApp([init, Cmd.none], update, view);

export default App;
