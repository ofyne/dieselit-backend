import cors from '@fastify/cors'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const plugin: FastifyPluginAsync = async app => {
	await app.register(cors, {
		origin: [
			'http://localhost:5173',
			'http://localhost:5174',
			'http://127.0.0.1:5173',
			'http://127.0.0.1:5174',
		],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		exposedHeaders: ['Content-Type'],
		maxAge: 86400,
	})
}

export const corsPlugin = fp(plugin, { name: 'cors' })
