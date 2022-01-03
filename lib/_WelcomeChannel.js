"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._WelcomeChannel = void 0;
const _TextChannel_1 = require("./_TextChannel");
class _WelcomeChannel extends _TextChannel_1._TextChannel {
    constructor(data, channel, amateras) {
        super(channel, amateras);
        this.welcomeText = data.welcomeText;
    }
    toData() {
        return {
            id: this.id,
            welcomeText: this.welcomeText
        };
    }
}
exports._WelcomeChannel = _WelcomeChannel;
//# sourceMappingURL=_WelcomeChannel.js.map