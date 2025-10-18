import { EventEmitter } from 'events';

let testEnv: TestEnv | null = null;

export type MousePayload = {
  x: number;
  y: number;
};

export type WheelPayload = {
  deltaX: number;
  deltaY: number;
};

export class TestEnv extends EventEmitter {
  private ready = false;

  constructor() {
    super();

    if (testEnv) return testEnv;
    testEnv = this;
  }

  handleMessage(
    e: MessageEvent<{
      type: string;
      x: number;
      y: number;
      deltaX?: number;
      deltaY?: number;
    }>,
  ) {
    const {
      data: { type, x, y, deltaX, deltaY },
    } = e;

    switch (type) {
      case 'MouseMove':
        testEnv?.emit('MouseMove', { x, y });
        break;
      case 'MouseDown':
        testEnv?.emit('MouseDown', { x, y });
        break;
      case 'MouseUp':
        testEnv?.emit('MouseUp', { x, y });
        break;
      case 'Wheel':
        testEnv?.emit('Wheel', { x, y, deltaX, deltaY });
        break;
    }
  }

  init() {
    if (this.ready) return;

    window.addEventListener('message', this.handleMessage);

    this.ready = true;
  }

  depose() {
    window.removeEventListener('message', this.handleMessage);
  }
}
