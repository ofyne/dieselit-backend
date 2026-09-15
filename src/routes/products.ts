import type { FastifyPluginAsync } from 'fastify'

export const productRoutes: FastifyPluginAsync = async app => {
	// public: список
	app.get('/', async () => {
		const items = await app.prisma.product.findMany({
			orderBy: { createdAt: 'desc' },
		})
		return { items }
	})

	// public: один по slug
	app.get('/:slug', async (req, reply) => {
		const { slug } = req.params as { slug: string }
		const product = await app.prisma.product.findUnique({ where: { slug } })
		if (!product) {
			return reply.code(404).send({ error: 'Not found' })
		}
		return product
	})
}