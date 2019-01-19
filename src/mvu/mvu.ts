import { Action } from "redux";
import { ENGINE_METHOD_PKEY_ASN1_METHS } from "constants";

export type Dispatch<TMsg extends Action> = (msg: TMsg) => void

type Commands<TMsg extends Action> = {
    execute: (dispatch: Dispatch<TMsg>) => void;
}[];

export type Reaction<TState, TMsg extends Action> = [TState, Commands<TMsg>];

export type Update<TModel, TMsg extends Action> =
    (model: TModel, msg: TMsg) => Reaction<TModel, TMsg>;

export type View<TModel, TMsg extends Action, TComponent> =
    (model: TModel, dispatch: Dispatch<TMsg>) => TComponent;

export type Middleware<TModel, TMsg extends Action> =
    (update: Update<TModel, TMsg>) => Update<TModel, TMsg>;

export const Cmd = {
    ofPromise: <TMsg extends Action>(promise: Promise<TMsg>): Commands<TMsg> => {
        return [{
            execute: async (dispatch: Dispatch<TMsg>) => {
                try {
                    console.log("BEFORE PROMISE");
                    const msg = await promise;
                    console.log(`AFTER PROMISE: ${JSON.stringify(msg)}`);
                    dispatch(msg);
                }
                catch (e) {
                    console.error(e);
                    throw e;
                }
            }
        }];
    },

    ofFunc: <TMsg extends Action>(f: () => TMsg): Commands<TMsg> => {
        return [{
            execute: (dispath: Dispatch<TMsg>) => {
                try {
                    dispath(f());
                }
                catch (e) {
                    console.error(e);
                    throw e;
                }
            }
        }];
    },

    ofMsg: <TMsg extends Action>(msg: TMsg): Commands<TMsg> => {
        return [{
            execute: (dispath: Dispatch<TMsg>) => {
                try {
                    dispath(msg);
                }
                catch (e) {
                    console.error(e);
                    throw e;
                }
            }
        }];
    },

    ofList: <TMsg extends Action>(...cmds: Commands<TMsg>[]) : Commands<TMsg> => {
        const reduced = cmds.reduce((akk, c) => [...akk, ...c], []);
        return [{
            execute: (dispath) => {
                for(const cmd of reduced)
                    cmd.execute(dispath);
            }
        }];
    },

    none: [],

    map: <M1 extends Action, M2 extends Action>(cmd: Commands<M1>, mapper: (msg: M1) => M2): Commands<M2> => {
        return cmd.map(c => {
            return {
                execute: (dispatch: Dispatch<M2>) => {
                    return c.execute(d => dispatch(mapper(d)));
                }
            }
        });
    }
}

export const Dispatch = {
    map: <M1 extends Action, M2 extends Action>(dispatch: Dispatch<M2>, fn: (m1: M1) => M2, memoize = true) : Dispatch<M1> => {
        if(memoize)
        {
            var disp = dispatch as any;
            if(!disp.__memo)
            {
                disp.__memo = new Map();
            }
            if(!disp.__memo.get(fn))
            {
                disp.__memo.set(fn, (m1: M1) => dispatch(fn(m1)));
            }
            return disp.__memo.get(fn);
        }
        return (m1: M1) => dispatch(fn(m1));
    }
}






