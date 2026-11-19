class DominioError(Exception):
    status_code = 400

class NoEncontrado(DominioError):
    status_code = 404

class Duplicado(DominioError):
    status_code = 409

class PedidoAjeno(DominioError):
    status_code = 403

class ReglaInvalida(DominioError):
    status_code = 400
