module.exports = (request, response, next) => {
  const allowedMethods = [
    "OPTIONS",
    "HEAD",
    "CONNECT",
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
  ];

  if (!allowedMethods.includes(request.method)) {
    response.status(405).send(`${request.method} not allowed`);
  } else {
    next();
  }
};
