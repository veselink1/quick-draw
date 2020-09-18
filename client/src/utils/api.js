export class APIError extends Error {
    constructor(message, response) {
        super(message);
        this.response = response;
        this.status = response.status;
    }
}
