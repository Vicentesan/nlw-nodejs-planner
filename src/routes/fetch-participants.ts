import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { ClientError } from '../errors/client-error'

export async function fetchParticipants(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/participants',
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
        response: {
          200: z.object({
            participants: z
              .object({
                id: z.string(),
                tripId: z.string().uuid(),
                name: z.string().nullable(),
                email: z.string().email(),
                isOwner: z.boolean(),
                isConfirmed: z.boolean(),
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
          participants: {
            select: {
              id: true,
              tripId: true,
              name: true,
              email: true,
              isOwner: true,
              isConfirmed: true,
            }
          },
        },
      })

      if (!trip) throw new ClientError('Trip not found')

      return res.status(200).send({ participants: trip.participants })
    }
  )
}
