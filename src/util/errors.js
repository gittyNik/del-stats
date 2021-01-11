import { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } from '../constants/httpResponseCodes';

/* eslint max-classes-per-file: ["error", 4] */
class HttpError extends Error {
  constructor({
    message, name, statusCode, data,
  }) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, HttpError);
  }
}

class HttpBadRequest extends HttpError {
  constructor(message = 'Bad request', data) {
    super({
      message,
      name: 'HttpBadRequest',
      statusCode: BAD_REQUEST,
      data,
    });
  }
}

class HttpNotFound extends HttpError {
  constructor(message = 'Not Found', data) {
    super({
      message,
      name: 'HttpNotFound',
      statusCode: NOT_FOUND,
      data,
    });
  }
}

class HttpInternalServerError extends HttpError {
  constructor(message = 'Internal server error', data) {
    super({
      message,
      name: 'HttpInternalServerError',
      statusCode: INTERNAL_SERVER_ERROR,
      data,
    });
  }
}

export {
  HttpError,
  HttpBadRequest,
  HttpNotFound,
  HttpInternalServerError,
};
