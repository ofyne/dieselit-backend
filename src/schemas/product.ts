import { z } from 'zod'

export const productInput = z.object({
	title: z.string().min(1).max(120),
	slug: z.string().min(1).max(80).optional(),
	description: z.string().min(1).max(2000),
	price: z.number().int().min(0),
	images: z.array(z.string().min(1)).min(1).max(5),
	sizes: z.array(z.string().min(1).max(6)).max(10),
	inStock: z.boolean().default(true),
})

export type ProductInput = z.infer<typeof productInput>