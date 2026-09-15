import { productInput } from '@/schemas/product.js'
import { slugify } from '@/utils/slugify.js'
import type { FastifyPluginAsync } from 'fastify'

export const adminProductRoutes: FastifyPluginAsync = async app => {
	// все роуты под auth
	app.addHook('preHandler', app.authenticate)

	// список (для админки)
	app.get('/', async () => {
		const items = await app.prisma.product.findMany({
			orderBy: { createdAt: 'desc' },
		})
		return { items }
	})

	// один товар по id (для формы редактирования)
	app.get('/:id', async (req, reply) => {
		const { id } = req.params as { id: string }

		const product = await app.prisma.product.findUnique({ where: { id } })
		if (!product) {
			return reply.code(404).send({ error: 'Not found' })
		}
		return product
	})

	// создать
	app.post('/', async (req, reply) => {
		const parsed = productInput.safeParse(req.body)
		if (!parsed.success) {
			return reply.code(400).send({
				error: 'Invalid body',
				issues: parsed.error.flatten().fieldErrors,
			})
		}

		const data = parsed.data
		const slug = data.slug ?? slugify(data.title)

		// уникальность slug
		const existing = await app.prisma.product.findUnique({ where: { slug } })
		if (existing) {
			return reply.code(409).send({ error: 'Slug already exists' })
		}

		const created = await app.prisma.product.create({
			data: {
				slug,
				title: data.title,
				description: data.description,
				price: data.price,
				images: data.images,
				sizes: data.sizes,
				inStock: data.inStock,
			},
		})

		return reply.code(201).send(created)
	})

	// обновить
	app.put('/:id', async (req, reply) => {
		const { id } = req.params as { id: string }

		const parsed = productInput.safeParse(req.body)
		if (!parsed.success) {
			return reply.code(400).send({
				error: 'Invalid body',
				issues: parsed.error.flatten().fieldErrors,
			})
		}

		const exists = await app.prisma.product.findUnique({ where: { id } })
		if (!exists) {
			return reply.code(404).send({ error: 'Not found' })
		}

		const data = parsed.data
		const slug = data.slug ?? exists.slug

		// если меняем slug — проверь уникальность
		if (slug !== exists.slug) {
			const dup = await app.prisma.product.findUnique({ where: { slug } })
			if (dup) {
				return reply.code(409).send({ error: 'Slug already exists' })
			}
		}

		const updated = await app.prisma.product.update({
			where: { id },
			data: {
				slug,
				title: data.title,
				description: data.description,
				price: data.price,
				images: data.images,
				sizes: data.sizes,
				inStock: data.inStock,
			},
		})

		return updated
	})

	// удалить
	app.delete('/:id', async (req, reply) => {
		const { id } = req.params as { id: string }

		const exists = await app.prisma.product.findUnique({ where: { id } })
		if (!exists) {
			return reply.code(404).send({ error: 'Not found' })
		}

		await app.prisma.product.delete({ where: { id } })
		return reply.code(204).send()
	})
}
