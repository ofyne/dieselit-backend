import { env } from '@/config/env.js'
import type { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir, unlink } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { pipeline } from 'node:stream/promises'

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export const uploadRoutes: FastifyPluginAsync = async app => {
	app.addHook('preHandler', app.authenticate)

	app.post('/', async (req, reply) => {
		const file = await req.file({ limits: { fileSize: MAX_SIZE } })
		if (!file) {
			return reply.code(400).send({ error: 'No file' })
		}

		const ext = extname(file.filename).toLowerCase()
		if (!ALLOWED.has(ext)) {
			// слить stream, чтобы не завис
			await pipeline(file.file, createWriteStream('/dev/null')).catch(() => {})
			return reply.code(400).send({ error: 'Unsupported file type' })
		}

		const uploadDir = resolve(env.UPLOAD_DIR)
		await mkdir(uploadDir, { recursive: true })

		const filename = `${randomUUID()}${ext}`
		const dest = join(uploadDir, filename)

		try {
			await pipeline(file.file, createWriteStream(dest))

			if (file.file.truncated) {
				await unlink(dest).catch(() => {})
				return reply.code(413).send({ error: 'File too large' })
			}
		} catch (e) {
			app.log.error(e)
			await unlink(dest).catch(() => {})
			return reply.code(500).send({ error: 'Upload failed' })
		}

		return {
			url: `${env.PUBLIC_URL}/uploads/${filename}`,
			filename,
		}
	})
}