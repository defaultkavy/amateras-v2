"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ButtonsManager {
    constructor(amateras) {
        this.amateras = amateras;
        this.cache = {};
    }
    addButton(button, message, fn) {
        // Set a function for each button.
        this.cache[message.id] = {
            [button.customId]: {
                function: fn
            }
        };
    }
    clearButton(message) {
        delete this.cache[message.id];
    }
}
exports.default = ButtonsManager;
