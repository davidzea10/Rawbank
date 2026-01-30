const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    ok: false,
    message: err.message || 'Erreur interne du serveur',
  });
};

module.exports = errorHandler;
