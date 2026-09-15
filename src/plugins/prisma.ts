import { PrismaClient } from '@prisma/client'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
	interface FastifyInstance {
		prisma: PrismaClient
	}
}

const plugin: FastifyPluginAsync = async app => {
	const prisma = new PrismaClient()
	await prisma.$connect()

	app.decorate('prisma', prisma)
	app.addHook('onClose', async () => {
		await prisma.$disconnect()
	})
}

export const prismaPlugin = fp(plugin, { name: 'prisma' })
