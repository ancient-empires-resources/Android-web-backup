import { FULLSCREEN_SETTINGS_TOGGLE_ID } from "./key_element_ids.js";
import Observer from "./observer.js";

const FULLSCREEN_LOCAL_STORAGE_KEY = "enter-fullscreen-on-game-start";

export const shouldEnterFullScreenOnGameStart = () => Boolean(localStorage.getItem(FULLSCREEN_LOCAL_STORAGE_KEY));

const fullscreenSettingsProxy = new Proxy({
    /** @type { Set<Observer> } */
    observers: new Set(),
    /** @type { boolean } */
    enterFullscreenOnGameStart: shouldEnterFullScreenOnGameStart()
}, {
    set: (target, prop, value) => {
        return Reflect.has(target, prop)
            && Reflect.set(target, prop, Boolean(value))
            && (() => {
                switch (prop) {
                    default:
                        break;
                    case "enterFullscreenOnGameStart":
                        {
                            target.observers.forEach((observer) => {
                                observer.receive(Boolean(value));
                            })
                        }
                        break;
                }
                return true;
            })();
    }
});

class FullscreenLocalStorageObserver extends Observer {
    constructor() {
        super();
    }

    /** @override */
    receive(value) {
        if (value) {
            localStorage.setItem(FULLSCREEN_LOCAL_STORAGE_KEY, true);
        } else {
            localStorage.removeItem(FULLSCREEN_LOCAL_STORAGE_KEY);
        }
    }
}

class FullscreenCheckboxObserver extends Observer {
    constructor(checkbox) {
        super();

        this.checkbox = checkbox;

        checkbox.checked = fullscreenSettingsProxy.enterFullscreenOnGameStart;
        checkbox.addEventListener("click", FullscreenCheckboxObserver.clickEventListener);
    }

    /** @override */
    receive(value) {
        this.checkbox.checked = Boolean(value);
    }

    static clickEventListener(e) {
        fullscreenSettingsProxy.enterFullscreenOnGameStart = e.target.checked;
    }
}

const fullscreenLocalStorageObserver = new FullscreenLocalStorageObserver();
const fullscreenCheckboxObserver = new FullscreenCheckboxObserver(document.getElementById(FULLSCREEN_SETTINGS_TOGGLE_ID));

const initFullscreenSettings = () => {
    fullscreenSettingsProxy.observers.add(fullscreenLocalStorageObserver);
    fullscreenSettingsProxy.observers.add(fullscreenCheckboxObserver);
}

export default initFullscreenSettings;