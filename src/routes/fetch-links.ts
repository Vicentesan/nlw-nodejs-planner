import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { ClientError } from '@/errors/client-error'
import { prisma } from '@/lib/prisma'

export async function fetchLinks(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/links',
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
        response: {
          200: z.object({
            links: z
              .object({
                id: z.string().uuid(),
                title: z.string(),
                url: z.string().url(),
              })
              .array(),
          }),
        },
      },
    },
    async (req, res) => {
      const { tripId } = req.params

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          links: {
            select: {
              id: true,
              title: true,
              url: true,
            },
          },
        },
      })

      if (!trip) throw new ClientError('Trip not found')

      return res.status(200).send({ links: trip.links })
    },
  )
}
