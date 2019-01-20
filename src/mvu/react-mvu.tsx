import * as React from 'react';
import { Action } from "redux";
import { View, Reaction, Update, Middleware, Dispatch } from './mvu';

export type ReactView<TModel, TMsg extends Action> = View<TModel, TMsg, JSX.Element>;

interface ViewProps<TModel, TMsg extends Action> {
    model: TModel;
    dispatch: Dispatch<TMsg>;
};

export const pure = <TModel, TMsg extends Action>(view: ReactView<TModel, TMsg>) => {
    const View = (props: ViewProps<TModel, TMsg>) => {
        const { model, dispatch } = props;
        return view(model, dispatch);
    };
    return class extends React.PureComponent<ViewProps<TModel, TMsg>> {
        render() {
            const { model, dispatch } = this.props;
            return <View model={model} dispatch={dispatch} />;
        }
    }
}

export const createReactApp =
    <TModel, TMsg extends Action>(
        initState: Reaction<TModel, TMsg>,
        update: Update<TModel, TMsg>,
        view: ReactView<TModel, TMsg>,
        middlewares?: Middleware<TModel, TMsg>[]
    ) => {
        const View = pure(view);
        const mdupdate = (middlewares || []).reduce((acc, m) => m.connectUpdate(acc), update);
        return class extends React.Component<{}, TModel> {
            constructor() {
                super({});
                const [st, cmds] = initState;
                this.state = st;
                for (const cmd of cmds)
                    cmd.execute(this.dispatch);
            }

            protected beforeDispatch = (msg:TMsg, newState : TModel) => {};

            private dispatch = (msg: TMsg) => {
                const [newState, cmds] = mdupdate(this.state, msg);
                this.beforeDispatch(msg, newState);
                this.setState(newState);
                for (const cmd of cmds)
                    cmd.execute(this.dispatch);
            }

            render() {
                return <View model={this.state} dispatch={this.dispatch} />;
            }
        }
    };

