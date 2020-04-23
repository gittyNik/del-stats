import Express from "express";
import { sendMessage } from "../controllers/web.controller";

const router = Express.Router();

router.post("/send-message", sendMessage);

export default router;
