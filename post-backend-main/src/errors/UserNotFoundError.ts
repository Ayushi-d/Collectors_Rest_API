import { HttpError } from 'routing-controllers';

export default class UserNotFoundError extends HttpError {

  constructor() {
    super(404, 'User not found!');
  }

}
