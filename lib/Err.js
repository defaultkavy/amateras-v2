"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Err = void 0;
class Err extends Error {
    constructor(message) {
        super(message);
        this.name = "Err";
        console.error('Error: ' + this.message);
    }
}
exports.Err = Err;
//# sourceMappingURL=Err.js.map