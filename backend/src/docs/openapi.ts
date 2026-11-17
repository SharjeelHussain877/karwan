const userSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "1" },
    name: { type: "string", example: "Sharjeel Hussain" },
    email: { type: "string", format: "email", example: "sharjeel@example.com" },
    role: { type: "string", example: "admin" }
  },
  required: ["id", "name", "email", "role"]
};

export const openApiDocument: Record<string, unknown> = {
  openapi: "3.1.0",
  info: {
    title: "Dadsmith API",
    version: "1.0.0",
    description: "Backend API powering Google Ads campaign management."
  },
  servers: [{ url: "/api" }],
  tags: [{ name: "User" }],
  paths: {
    "/user": {
      get: {
        tags: ["User"],
        summary: "List users",
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "number", example: 200 },
                    data: { type: "array", items: userSchema }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/user/adduser": {
      post: {
        tags: ["User"],
        summary: "Create a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  role: { type: "string" }
                },
                required: ["name", "email", "role"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Created user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "number", example: 200 },
                    data: userSchema,
                    token: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/user/{id}": {
      put: {
        tags: ["User"],
        summary: "Update a user",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  role: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "User updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "number", example: 200 },
                    message: { type: "string", example: "Data updated successfully" }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ["User"],
        summary: "Delete a user",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "User deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "number", example: 200 },
                    message: { type: "string", example: "Data deleted successfully" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
