"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (str) => {
    return (data) => new Function(`{${Object.keys(data).join(",")}}`, "return `" + str + "`")(data);
};
//# sourceMappingURL=template.js.map