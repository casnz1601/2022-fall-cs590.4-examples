export const keycloak = {
  client_id: "smoothie",
  client_secret: "ky5KxeEJOVkK6fyLGllGDToYKuTyUDNR", // TODO
  redirect_uris: ["http://127.0.0.1:8080/api/login-callback"],
  post_logout_redirect_uris: [""],
  response_types: ["code"],
}