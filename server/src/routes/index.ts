import { Router, Request, Response } from "express";

const router: Router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("server is up and running");
});

export default router;
