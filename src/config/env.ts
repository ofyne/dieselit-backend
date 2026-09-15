import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
	DATABASE_URL: z.string().min(1),
	JWT_SECRET: z.string().min(16),
	PORT: z.coerce.number().default(3000),
	HOST: z.string().default('0.0.0.0'),
	UPLOAD_DIR: z.string().default('./uploads'),
	PUBLIC_URL: z.string().default('http://localhost:3000'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
	console.error('❌ Invalid env:', parsed.error.flatten().fieldErrors)
	process.exit(1)
}

export const env = parsed.data