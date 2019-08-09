"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (data) => {
    return (str) => new Function(`{${Object.keys(data).join(",")}}`, "return `" + str + "`")(data);
};
//# sourceMappingURL=template.js.map