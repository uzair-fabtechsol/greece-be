declare module "xss-clean" {
  import type { RequestHandler } from "express";
  const xssClean: () => RequestHandler;
  export default xssClean;
}

declare module "xss-clean/lib/xss" {
  function clean<T>(data: T): T;
  export { clean };
}
