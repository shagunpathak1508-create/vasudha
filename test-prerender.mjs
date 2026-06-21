import server from "./dist/server/server.js";
const req = new Request("http://localhost/");
const res = await server.fetch(req, {}, {});
const html = await res.text();
console.log(html.substring(0, 500));
