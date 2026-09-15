import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

const products = [
	{
		slug: 'classic-hoodie',
		title: 'Classic Hoodie',
		description: 'Heavyweight 380 gsm hoodie. Back print, oversize fit.',
		price: 4900,
		images: [
			'/image/hoodie.jpg',
			'/image/stickers.jpg',
			'/image/tee-black.jpg',
			'/image/longsleeve.jpg',
		],
		sizes: ['S', 'M', 'L', 'XL'],
	},
	{
		slug: 'tee-white',
		title: 'Tee White',
		description: '100% cotton, 220 gsm. Front print.',
		price: 2200,
		images: [
			'/image/tee-white.jpg',
			'/image/cap.jpg',
			'/image/hoodie.jpg',
			'/image/tee-black.jpg',
			'/image/stickers.jpg',
		],
		sizes: ['S', 'M', 'L', 'XL', 'XXL'],
	},
	{
		slug: 'logo-cap',
		title: 'Logo Cap',
		description: 'Cap with embroidered logo. One size.',
		price: 1800,
		images: ['/image/cap.jpg', '/image/tee-white.jpg', '/image/longsleeve.jpg'],
		sizes: [],
	},
	{
		slug: 'sticker-pack',
		title: 'Sticker Pack',
		description: 'Set of 5 vinyl stickers.',
		price: 600,
		images: [
			'/image/stickers.jpg',
			'/image/hoodie.jpg',
			'/image/cap.jpg',
			'/image/tee-black.jpg',
		],
		sizes: [],
	},
	{
		slug: 'tee-black',
		title: 'Tee Black',
		description: 'Same base, black. Front print.',
		price: 2200,
		images: [
			'/image/tee-black.jpg',
			'/image/longsleeve.jpg',
			'/image/tee-white.jpg',
			'/image/stickers.jpg',
			'/image/hoodie.jpg',
		],
		sizes: ['S', 'M', 'L', 'XL'],
	},
	{
		slug: 'longsleeve',
		title: 'Longsleeve',
		description: 'Long sleeve with back print. 100% cotton.',
		price: 2900,
		images: ['/image/longsleeve.jpg', '/image/tee-black.jpg', '/image/cap.jpg'],
		sizes: ['S', 'M', 'L', 'XL'],
	},
]

async function main() {
	console.log('🌱 Seeding...')

	const username = process.env.ADMIN_USERNAME ?? 'admin'
	const password = process.env.ADMIN_PASSWORD ?? 'admin'
	const passwordHash = await bcrypt.hash(password, 10)

	await prisma.admin.upsert({
		where: { username },
		update: {},
		create: { username, passwordHash },
	})

	console.log(`👤 Admin ready: ${username}`)

	for (const p of products) {
		await prisma.product.upsert({
			where: { slug: p.slug },
			update: p,
			create: p,
		})
	}

	console.log(`📦 ${products.length} products upserted`)
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
