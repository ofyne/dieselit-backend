import { env } from '@/config/env.js'
import { corsPlugin } from '@/plugins/cors.js'
import { jwtPlugin } from '@/plugins/jwt.js'
import { prismaPlugin } from '@/plugins/prisma.js'
import { adminProductRoutes } from '@/routes/admin-products.js'
import { authRoutes } from '@/routes/auth.js'
import { productRoutes } from '@/routes/products.js'
import { uploadRoutes } from '@/routes/upload.js'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import Fastify from 'fastify'
import { resolve } from 'node:path'

export const buildApp = () => {
	const app = Fastify({
		logger: {
			level: 'info',
			transport:
				process.env.NODE_ENV === 'production'
					? undefined
					: { target: 'pino-pretty' },
		},
	})

	// core plugins
	app.register(corsPlugin)
	app.register(prismaPlugin)
	app.register(jwtPlugin)

	// multipart (uploads)
	app.register(multipart, {
		limits: { fileSize: 5 * 1024 * 1024, files: 1 },
	})

	// static: отдаём загруженные файлы
	app.register(fastifyStatic, {
		root: resolve(env.UPLOAD_DIR),
		prefix: '/uploads/',
		decorateReply: false,
	})

	// health
	app.get('/health', async () => ({ ok: true }))

	// routes
	app.register(authRoutes, { prefix: '/api/auth' })
	app.register(productRoutes, { prefix: '/api/products' })
	app.register(adminProductRoutes, { prefix: '/api/admin/products' })
	app.register(uploadRoutes, { prefix: '/api/admin/upload' })

	return app
}