export const normalizeApiError = (error, fallbackMessage = 'Request failed') => {
  const responseData = error?.response?.data;
  const nestedError = responseData?.error;
  const payload = error?.payload;

  return {
    statusCode: nestedError?.statusCode || error?.response?.status,
    code: nestedError?.code || responseData?.code || payload?.code,
    field: nestedError?.field || responseData?.field || payload?.field,
    message: nestedError?.message
      || responseData?.message
      || payload?.message
      || error?.message
      || fallbackMessage
  };
};

export const getRejectedError = (error, fallbackMessage) => (
  normalizeApiError(error, fallbackMessage)
);

