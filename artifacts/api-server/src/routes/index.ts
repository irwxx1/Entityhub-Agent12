import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pesertaRouter from "./peserta";
import adminRouter from "./admin";
import storageRouter from "./storage";
import memberRouter from "./member";
import forumRouter from "./forum";
import suaraRouter from "./suara";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pesertaRouter);
router.use(adminRouter);
router.use(storageRouter);
router.use(memberRouter);
router.use(forumRouter);
router.use(suaraRouter);

export default router;
