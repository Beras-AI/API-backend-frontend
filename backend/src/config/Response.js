/* eslint-disable linebreak-style */
export const successResponse = (
  res,
  data = null,
  statusCode = 200,
  message = "success"
) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });

export const errorResponse = (
  res,
  statusCode = 500,
  message = "something went wrong"
) =>
  res.status(statusCode).json({
    success: false,
    message,
  });
