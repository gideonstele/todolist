/**
 * enhanced unstated-next
 */
import type { PropsWithChildren, ReactNode } from 'react';
import { createContext, useContext } from 'react';

export type UseContainerFn<Props extends object, HookReturn> = (args: Props) => HookReturn;

export type UseFn<HookReturn> = () => HookReturn;

const nilSymbol = Symbol('nil');

export default function createContextContainer<HookReturn, Props extends object>(
  useContainer: UseContainerFn<Props, HookReturn>,
  defaultInjection?: HookReturn,
) {

  
  const Context = createContext<HookReturn | undefined | symbol>(nilSymbol);

  Context.displayName = 'Context-' + useContainer.name;

  function Provider({ children, ...props }: PropsWithChildren<Props>) {
    const injection = useContainer((props || {}) as Props);
    return <Context.Provider value={injection ?? defaultInjection as HookReturn}>{children}</Context.Provider>;
  }

  const UseContainer: UseFn<HookReturn> = function () {
    const data = useContext(Context);
    if (data === nilSymbol) throw new Error('cannot inject service before started');
    return data as HookReturn;
  };
  return [Provider, UseContainer] as [(props: PropsWithChildren<Props>) => ReactNode, UseFn<HookReturn>];
}
