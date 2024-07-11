import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function createLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/links', {
    schema: {
      params: z.object({ tripId: z.string().uuid() }),
      body: z.object({
        title: z.string().min(4),
        url: z.string().url(),
      }),
      response: {
        201: z.object({
          linkId: z.string().uuid()
        })
      }
    }
  }, async (req, res) => {
    const { tripId } = req.params
    const { title, url } = req.body

    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    })

    if (!trip)
      throw new Error('Trip not found')

    const link = await prisma.link.create({
      data: {
        tripId,
        title,
        url,
      }
    })

    return res.status(201).send({ linkId: link.id })
  })
}