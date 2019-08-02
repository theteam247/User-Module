"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseError extends Error {
    constructor(message, status) {
        super(message);
        this.name = "Base Error";
        this.message = "";
        this.status = 500;
        this.status = status;
    }
    toJSON() {
        return Object.assign({ name: this.name, message: this.message }, this);
    }
}
exports.BaseError = BaseError;
class BadRequestError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "Bad Request";
        this.status = 400;
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "Unauthorized";
        this.status = 401;
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "Forbidden";
        this.status = 403;
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "Not Found";
        this.status = 404;
    }
}
exports.NotFoundError = NotFoundError;
class GoneError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "Gone";
        this.status = 410;
    }
}
exports.GoneError = GoneError;
class InternalServerError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "Internal Server Error";
        this.status = 500;
    }
}
exports.InternalServerError = InternalServerError;
class NotImplementedError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "Not Implemented";
        this.status = 501;
    }
}
exports.NotImplementedError = NotImplementedError;
class ServiceUnavailableError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "Service Unavailable";
        this.status = 503;
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class PermissionDeniedError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "Permission Denied";
        this.status = 550;
    }
}
exports.PermissionDeniedError = PermissionDeniedError;
//# sourceMappingURL=error.js.map