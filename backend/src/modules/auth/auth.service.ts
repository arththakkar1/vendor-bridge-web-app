import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { logAction } from '../../services/audit.service';
import { SystemRole } from '@prisma/client';

export async function register(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already in use.');

  const role = await db.role.findUnique({ where: { roleName: data.role as SystemRole } });
  if (!role) throw new Error('Invalid role.');

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      roleId: role.id,
    },
    include: { role: true },
  });

  await logAction('USER_REGISTERED', `User ${user.email} registered with role ${data.role}.`, user.id);

  return { id: user.id, name: user.name, email: user.email, role: user.role.roleName };
}

export async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email }, include: { role: true } });
  if (!user) throw new Error('Invalid credentials.');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials.');

  const token = jwt.sign(
    { userId: user.id, role: user.role.roleName },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any, algorithm: 'HS256' },
  );

  await logAction('USER_LOGGED_IN', `User ${user.email} logged in.`, user.id);

  return { token, user: { id: user.id, name: user.name, role: user.role.roleName } };
}
