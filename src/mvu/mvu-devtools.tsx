import * as React from 'react';
import { } from 'redux-devtools-extension';

export const withDevTools = (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__);

export const useDevTools = (cls: typeof React.Component) => {
    if (withDevTools) {
        return class extends cls {
            constructor(props: any) {
                super(props);
            }

            private devTools: any = null;
            private unsubscribe = () => { };

            protected beforeDispatch = (msg: any, newState: any) => {
                this.devTools.send(msg, newState);
            };

            componentWillMount = () => {
                this.devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect();
                this.devTools.init(this.state);
                this.unsubscribe = this.devTools.subscribe((msg: any) => {
                    if (msg.type === 'DISPATCH' && msg.payload.type === 'JUMP_TO_ACTION') {
                        this.setState(JSON.parse(msg.state));
                    }
                });
            }

            componentWillUnmount = () => {
                this.unsubscribe();
                (window as any).__REDUX_DEVTOOLS_EXTENSION__.disconnect();
            }
        };
    }
    else {
        return cls;
    }
}
