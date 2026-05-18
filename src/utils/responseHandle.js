const responseHandler = (res, statusCode, status, message, data = null, token = null) => {
    const response = {
        status,
        message,
    };

    if (data) response.data = data;
    if (token) response.token = token;

    return res.status(statusCode).json(response);
};

export default responseHandler;