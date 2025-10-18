import { useEffect, useRef } from 'react';
import { TestEnv } from '../test-env';

const testEnv = new TestEnv();

testEnv.init();

type MousePayload = {
  x: number;
  y: number;
};

export type WheelPayload = {
  deltaX: number;
  deltaY: number;
};

function createMouseEvent(el: Element, type: string, payload: MousePayload) {
  const { x, y } = payload;
  const evt = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    view: window,
  });
  el.dispatchEvent(evt);
  return evt;
}

export const useEnvEvents = () => {
  const currentElement = useRef<Element>(null);
  const isClicking = useRef(false);

  useEffect(() => {
    testEnv.on('MouseDown', ({ x, y }: MousePayload) => {
      currentElement.current = document.elementFromPoint(x, y);
      isClicking.current = true;

      if (currentElement.current) {
        createMouseEvent(currentElement.current, 'mousedown', { x, y });
      }

      setTimeout(() => {
        isClicking.current = false;
      }, 500);
    });

    testEnv.on('MouseUp', ({ x, y }: MousePayload) => {
      const target = document.elementFromPoint(x, y);

      if (target) {
        createMouseEvent(target as Element, 'mouseup', { x, y });

        if (isClicking.current && target === currentElement.current) {
          // (target as HTMLElement).click();
          createMouseEvent(target as Element, 'click', { x, y });
        }
      }
    });

    testEnv.on('MouseMove', ({ x, y }: MousePayload) => {
      const target = document.elementFromPoint(x, y);
      if (target) {
        createMouseEvent(target as Element, 'mousemove', { x, y });
        createMouseEvent(target as Element, 'mouseover', { x, y });
        createMouseEvent(target as Element, 'mouseenter', { x, y });
      }
    });

    return () => {
      testEnv.depose();
    };
  }, []);
};
