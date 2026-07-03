import { Router, type IRouter, type Request, type Response } from "express";
import { registerMember, loginMember, requireMember } from "../lib/memberAuth";
import { z } from "zod/v4";

const router: IRouter = Router();

const RegisterBody = z.object({
  nama: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
});

router.post("/member/register", async (req: Request, res: Response) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data pendaftaran tidak valid" });
    return;
  }
  const result = await registerMember(
    parsed.data.nama,
    parsed.data.email,
    parsed.data.password
  );
  if ("error" in result) {
    res.status(409).json({ error: result.error });
    return;
  }
  res.cookie("memberSession", JSON.stringify(result), {
    signed: true,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json({ nama: result.nama, email: result.email });
});

const LoginBody = z.object({
  email: z.email(),
  password: z.string().min(1),
});

router.post("/member/login", async (req: Request, res: Response) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email dan password wajib diisi" });
    return;
  }
  try {
    const session = await loginMember(parsed.data.email, parsed.data.password);
    if (!session) {
      res.status(401).json({ error: "Email atau password salah" });
      return;
    }
    res.cookie("memberSession", JSON.stringify(session), {
      signed: true,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ nama: session.nama, email: session.email });
  } catch (err) {
    req.log.error({ err }, "Member login error");
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/member/logout", requireMember, (req: Request, res: Response) => {
  res.clearCookie("memberSession");
  res.json({ ok: true });
});

router.get("/member/me", requireMember, (req: Request, res: Response) => {
  res.json({ nama: req.member!.nama, email: req.member!.email });
});

export default router;
