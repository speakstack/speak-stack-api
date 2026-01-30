import { registerAs } from "@nestjs/config";

export default registerAs("database", () => ({
  host: Bun.env.DATABASE_HOST || "localhost",
  port: parseInt(Bun.env.DATABASE_PORT || "5432", 10),
  username: Bun.env.DATABASE_USERNAME || "postgres",
  password: Bun.env.DATABASE_PASSWORD || "postgres",
  database: Bun.env.DATABASE_NAME || "speak_stack",
}));
