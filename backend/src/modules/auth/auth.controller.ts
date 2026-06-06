import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as authService from './auth.service';
import { db } from '../../config/database';
import { logAction } from '../../services/audit.service';

export async function registerHandler(req: Request, res: Response) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const { token, user } = await authService.login(req.body.email, req.body.password);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400000,
      path: '/',
    });
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message });
  }
}

export async function logoutHandler(_req: Request, res: Response) {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
}

export async function meHandler(req: Request, res: Response) {
  res.json({ success: true, user: req.user });
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = await db.user.findUnique({ where: { email } });
    // Always return 200 so email enumeration is not possible
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

    // Send email with reset link (wire up email.service.ts)
    // await emailService.send({ to: email, subject: 'Reset your VendorBridge password',
    //   html: `<a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>` });

    await logAction('PASSWORD_RESET_REQUESTED', `Reset token issued for ${email}.`);
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    const record = await db.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.used || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Token is invalid or expired.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await db.passwordResetToken.update({ where: { id: record.id }, data: { used: true } });
    await logAction('PASSWORD_RESET_COMPLETED', `Password reset for user ${record.userId}.`, record.userId);

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
