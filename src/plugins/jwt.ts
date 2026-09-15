import { env } from '@/config/env.js'
import fastifyJwt from '@fastify/jwt'
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: { sub: string; username: string }
		user: { sub: string; username: string }
	}
}

const plugin: FastifyPluginAsync = async app => {
	app.register(fastifyJwt, {
		secret: env.JWT_SECRET,
		sign: { expiresIn: '7d' },
	})

	app.decorate(
		'authenticate',
		async (req: FastifyRequest, reply: FastifyReply) => {
			try {
				await req.jwtVerify()
			} catch {
				reply.code(401).send({ error: 'Unauthorized' })
			}
		},
	)
}

declare module 'fastify' {
	interface FastifyInstance {
		authenticate: (
			req: FastifyRequest,
			reply: FastifyReply,
		) => Promise<void>
	}
}

export const jwtPlugin = fp(plugin, { name: 'jwt' })