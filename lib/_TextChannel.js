"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._TextChannel = void 0;
const _Channel_1 = require("./_Channel");
class _TextChannel extends _Channel_1._Channel {
    constructor(channel, amateras) {
        super(channel, amateras);
        this.get = channel;
        this.isWelcomeChannel = false;
    }
}
exports._TextChannel = _TextChannel;
//# sourceMappingURL=_TextChannel.js.map