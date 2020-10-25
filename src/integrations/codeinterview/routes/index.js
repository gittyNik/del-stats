import express from "express";
import padRoutes from "./pad.routes";
import { allowMultipleRoles } from "../../../controllers/auth/roles.controller";
import { USER_ROLES } from "../../../models/user";

const { ADMIN, SUPERADMIN, EDUCATOR } = USER_ROLES;

const router = express.Router();

// router.use(allowMultipleRoles([ADMIN, SUPERADMIN, EDUCATOR]));

router.use("/pad", padRoutes);

export default router;
