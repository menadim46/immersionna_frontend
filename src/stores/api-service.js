import axios from "axios";
// version nueva 21.05
const host = 'https://immersionna-0ac12e1aa919.herokuapp.com/api/';

const API_SERVICIOS = host + "servicios"
const API_RESERVAS = host + "reservas"
const API_CLIENTES = host + "clientes"
const API_SERVICIOS_INMERSION = host + "serviciosInmersion"
const API_SERVICIOS_INTERCAMBIO = host + "serviciosIntercambio"

function llamadaAPI(method = "get", body = null, path) {
  let config = {
    method: method,
    maxBodyLength: Infinity,
    url: path,
    headers: {},
    timeout: 10000,
  }
  if (body) {
    config.data = body;
    config.headers["Content-Type"] = "application/json";
  }
  return axios.request(config);
}
export function getServicios() {
  return llamadaAPI("get", null, API_SERVICIOS)
}
export function cambiarHttpPorHttps(enlace) {
  return enlace.replace('http', 'https')
}

export function postServicio(data) {
  return llamadaAPI("post", data, API_SERVICIOS)
}
export function postServicioInmersion(data) {
  return llamadaAPI("post", data, API_SERVICIOS_INMERSION)
}

export function postServicioIntercambio(data) {
  return llamadaAPI("post", data, API_SERVICIOS_INTERCAMBIO)
}
export function deleteServicio(data) {
  return llamadaAPI("delete", null, data)
}
export function patchServicio(entidad, data) {
  return llamadaAPI("patch", data, entidad)
}



export function getReservas() {
  return llamadaAPI("get", null, API_RESERVAS)
}

export function consultaReserva(url) {
  return llamadaAPI("get", null, url)
}

export function getServicioDeReserva(url) {
  return llamadaAPI("get", null, url)
}

export function getReservasServicio(servicio) {
  const urlReservasServicio = servicio._links.reservas.href
  return llamadaAPI("get", null, urlReservasServicio)
}

export function postReservaServicioInmersion(data) {
  return llamadaAPI("post", data, API_SERVICIOS_INMERSION)
}

export function postReservaServicioIntercambio(data) {
  return llamadaAPI("post", data, API_SERVICIOS_INTERCAMBIO)
}

export function deleteReserva(reservaId) {
  console.log("En apiservice, antes de delete: ", reservaId)
  return llamadaAPI("delete", null, reservaId)
}

export function patchReserva(entidad, data) {
  return llamadaAPI("patch", data, entidad)
}

export function putReserva(entidad, data) {
  return llamadaAPI("put", data, entidad)
}



export function getClientes() {
  return llamadaAPI("get", null, API_CLIENTES)
}
export function getCliente(url) {
  return llamadaAPI("get", null, url);
}



export function putEntidad(entidad, data) {
  return llamadaAPI("put", data, cambiarHttpPorHttps(entidad))
}

