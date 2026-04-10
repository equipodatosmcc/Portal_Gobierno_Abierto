import { NextResponse } from "next/server";

export const runtime = "nodejs";

const swaggerHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Swagger UI - Gobierno Abierto</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
    <style>
      body { margin: 0; background: #f8fafc; }
      .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/openapi',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        requestInterceptor: (request) => {
          request.credentials = 'include';
          return request;
        }
      });
    </script>
  </body>
</html>`;

export async function GET() {
  return new NextResponse(swaggerHtml, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
