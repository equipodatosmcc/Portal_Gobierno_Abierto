export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Gobierno Abierto API",
    version: "1.0.0",
    description:
      "API para CRUD de Noticias y Textos (WebContent), incluyendo upload físico de imágenes en el servidor.",
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [
    { name: "News", description: "Gestión de noticias" },
    { name: "WebContent", description: "Gestión de textos dinámicos" },
  ],
  paths: {
    "/api/news": {
      get: {
        tags: ["News"],
        summary: "Listar noticias",
        parameters: [
          {
            name: "publishedOnly",
            in: "query",
            schema: { type: "boolean" },
            required: false,
            description: "Si es true, devuelve solo publicadas.",
          },
        ],
        responses: {
          "200": {
            description: "Listado de noticias",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/News" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["News"],
        summary: "Crear noticia",
        description: "Requiere sesión con rol EDITOR o ADMIN.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                $ref: "#/components/schemas/NewsCreateMultipart",
              },
            },
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NewsCreateJson",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Noticia creada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/News" },
              },
            },
          },
          "403": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Slug duplicado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/news/{id}": {
      get: {
        tags: ["News"],
        summary: "Obtener noticia por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Noticia encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/News" },
              },
            },
          },
          "404": {
            description: "No encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["News"],
        summary: "Editar noticia",
        description: "Requiere sesión con rol EDITOR o ADMIN.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                $ref: "#/components/schemas/NewsUpdateMultipart",
              },
            },
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NewsUpdateJson",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Noticia actualizada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/News" },
              },
            },
          },
          "403": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "No encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["News"],
        summary: "Eliminar noticia",
        description: "Requiere sesión con rol EDITOR o ADMIN.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Noticia eliminada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/News" },
              },
            },
          },
          "403": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "No encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/texts": {
      get: {
        tags: ["WebContent"],
        summary: "Listar textos",
        parameters: [
          {
            name: "publishedOnly",
            in: "query",
            schema: { type: "boolean" },
            required: false,
          },
        ],
        responses: {
          "200": {
            description: "Listado de textos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/WebContent" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["WebContent"],
        summary: "Crear texto",
        description: "Requiere sesión con rol EDITOR o ADMIN.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WebContentCreate" },
            },
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/WebContentCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Texto creado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WebContent" },
              },
            },
          },
          "403": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/texts/{id}": {
      get: {
        tags: ["WebContent"],
        summary: "Obtener texto por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Texto encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WebContent" },
              },
            },
          },
          "404": {
            description: "No encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["WebContent"],
        summary: "Editar texto",
        description: "Requiere sesión con rol EDITOR o ADMIN.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WebContentUpdate" },
            },
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/WebContentUpdate" },
            },
          },
        },
        responses: {
          "200": {
            description: "Texto actualizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WebContent" },
              },
            },
          },
          "403": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "No encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["WebContent"],
        summary: "Eliminar texto",
        description: "Requiere sesión con rol EDITOR o ADMIN.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Texto eliminado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WebContent" },
              },
            },
          },
          "403": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "No encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      News: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          slug: { type: "string" },
          content: { type: "string" },
          image: { type: "string", nullable: true },
          category: { type: "string" },
          published: { type: "boolean" },
          authorId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "id",
          "title",
          "slug",
          "content",
          "category",
          "published",
          "authorId",
          "createdAt",
          "updatedAt",
        ],
      },
      NewsCreateJson: {
        type: "object",
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          content: { type: "string" },
          category: { type: "string", default: "General" },
          published: { type: "boolean", default: false },
        },
        required: ["title", "slug", "content"],
      },
      NewsCreateMultipart: {
        type: "object",
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          content: { type: "string" },
          category: { type: "string", default: "General" },
          published: { type: "boolean", default: false },
          image: { type: "string", format: "binary" },
        },
        required: ["title", "slug", "content"],
      },
      NewsUpdateJson: {
        type: "object",
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          content: { type: "string" },
          category: { type: "string" },
          published: { type: "boolean" },
          removeImage: { type: "boolean", default: false },
        },
      },
      NewsUpdateMultipart: {
        type: "object",
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          content: { type: "string" },
          category: { type: "string" },
          published: { type: "boolean" },
          removeImage: { type: "boolean", default: false },
          image: { type: "string", format: "binary" },
        },
      },
      WebContent: {
        type: "object",
        properties: {
          id: { type: "integer" },
          slug: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          published: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "slug", "title", "content", "published", "createdAt", "updatedAt"],
      },
      WebContentCreate: {
        type: "object",
        properties: {
          slug: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          published: { type: "boolean", default: false },
        },
        required: ["slug", "title", "content"],
      },
      WebContentUpdate: {
        type: "object",
        properties: {
          slug: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          published: { type: "boolean" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
    },
  },
} as const;
