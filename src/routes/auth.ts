import bcrypt from 'bcryptjs'
import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const loginBody = z.object({
	username: z.string().min(1),
	password: z.string().min(1),
})

export const authRoutes: FastifyPluginAsync = async app => {
	app.post('/login', async (req, reply) => {
		const parsed = loginBody.safeParse(req.body)
		if (!parsed.success) {
			return reply.code(400).send({ error: 'Invalid body' })
		}

		const { username, password } = parsed.data

		const admin = await app.prisma.admin.findUnique({ where: { username } })
		if (!admin) {
			return reply.code(401).send({ error: 'Invalid credentials' })
		}

		const ok = await bcrypt.compare(password, admin.passwordHash)
		if (!ok) {
			return reply.code(401).send({ error: 'Invalid credentials' })
		}

		const token = app.jwt.sign({ sub: admin.id, username: admin.username })
		return { token, username: admin.username }
	})

	app.get('/me', { preHandler: [app.authenticate] }, async req => {
		return { user: req.user }
	})
}