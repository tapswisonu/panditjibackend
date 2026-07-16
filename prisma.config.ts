export default {
  schema: {
    path: "prisma/schema.prisma",
  },
  migrate: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] as string,
  },
};
