import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Cmd, Dispatch, Reaction } from './mvu/mvu';
import { createReactApp, pure } from './mvu/react-mvu';
import * as Counter from './Counter';
import { createAction, ActionType, getType } from 'typesafe-actions';

const c1 = createAction("C1", r => (a: Counter.ActionsType) => r(a));
const c2 = createAction("C2", r => (a: Counter.ActionsType) => r(a));

const ct = {
  c1, c2
}

type AT = ActionType<typeof ct>;

const init = {
  C1 : Counter.init(),
  C2 : Counter.init()
};

const update = (model : typeof init, msg : AT) : Reaction<typeof init, AT> => {
  switch(msg.type)
  {
    case getType(c1):
      const [st1, cmd1] = Counter.update(model.C1, msg.payload)
      return [{...model, C1 : st1}, Cmd.map(cmd1, c1) ]
    case getType(c2):
      const [st, cmd] = Counter.update(model.C2, msg.payload)
      return [{...model, C2 : st}, Cmd.map(cmd, c2) ]
  }
}

const Cnt = pure(Counter.view);

const view = (model : typeof init, dispatch : Dispatch<AT>) => {
  return (
    <div>
    <Cnt model={model.C1} dispatch={Dispatch.map(dispatch, c1)} /> 
    <Cnt model={model.C2} dispatch={Dispatch.map(dispatch, c2)} /> 
    </div>
  );
}

const App = createReactApp([init, Cmd.none], update, view);

export default App;
