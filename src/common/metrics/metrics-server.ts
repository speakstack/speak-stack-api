import * as http from "http";
import { register } from "prom-client";
import { Logger } from "@nestjs/common";

/**
 * Serves /metrics from prom-client's default registry on a dedicated port.
 * This port is NOT published in docker-compose.yml, so it is only reachable
 * from the internal Docker network (Alloy scrapes it there).
 */
export async function startMetricsServer(): Promise<http.Server> {
  const logger = new Logger("MetricsServer");
  const port = Number(process.env.METRICS_PORT ?? 9464);

  const server = http.createServer(async (req, res) => {
    if (req.url === "/metrics") {
      try {
        const body = await register.metrics();
        res.writeHead(200, { "Content-Type": register.contentType });
        res.end(body);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
      return;
    }
    res.writeHead(404);
    res.end();
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "0.0.0.0", () => {
      logger.log(`Metrics server listening on :${port}/metrics`);
      resolve(server);
    });
  });
}
