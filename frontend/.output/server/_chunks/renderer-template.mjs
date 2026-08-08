import { b as HTTPResponse } from "../_libs/h3.mjs";
import "../_libs/unenv.mjs";



import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";





const rendererTemplate = () => new HTTPResponse('<!doctype html>\r\n<html lang="en">\r\n  <head>\r\n    <meta charset="UTF-8" />\r\n    <link rel="icon" type="image/svg+xml" href="/mavis-favicon.svg" />\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\r\n    <title>Mavis • AI Assistant</title>\r\n  </head>\r\n  <body>\r\n    <div id="root"></div>\r\n    <script type="module" src="/src/index.tsx"><\/script>\r\n  </body>\r\n</html>\r\n', { headers: { "content-type": "text/html; charset=utf-8" } });
function renderIndexHTML(event) {
  return rendererTemplate(event.req);
}
export {
  renderIndexHTML as default
};
