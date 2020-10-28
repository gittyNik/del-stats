import express from "express";
import padRoutes from "./pad.routes";
import detailRoutes from "./detail.routes";
import { allowMultipleRoles } from "../../../controllers/auth/roles.controller";
import { USER_ROLES } from "../../../models/user";

const { ADMIN, SUPERADMIN, EDUCATOR } = USER_ROLES;

const router = express.Router();

// router.use(allowMultipleRoles([ADMIN, SUPERADMIN, EDUCATOR]));

router.use("/pad", padRoutes);
router.use("/details", detailRoutes)

export default router;
