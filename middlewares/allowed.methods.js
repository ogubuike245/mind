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

  if (allowedMethods.includes(request.methods)) {
    response.status(405).send(`${re.method} not allowed`);
  }

  next();
};
