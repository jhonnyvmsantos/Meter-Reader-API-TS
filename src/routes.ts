import express from "express";
import measureController from "./controllers/measure.controller";

const router = express();

router.use("/measure", measureController);

export default router;
