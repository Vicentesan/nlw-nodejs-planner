import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { ClientError } from '../errors/client-error'
import { dayjs } from '../lib/dayjs'
import { prisma } from '../lib/prisma'

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/trips/:tripId',
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
        body: z.object({
          destination: z.string().min(4),
          startsAt: z.coerce.date(),
          endsAt: z.coerce.date(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (req, res) => {
      const { tripId } = req.params
      const { destination, startsAt, endsAt } = req.body

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) throw new ClientError('Trip not found.')

      if (dayjs(startsAt).isBefore(new Date()))
        throw new ClientError('Invalid start trip date.')

      if (dayjs(endsAt).isBefore(startsAt))
        throw new ClientError('Invalid end trip date.')

      await prisma.trip.update({
        where: {
          id: trip.id,
        },
        data: {
          destination,
          startsAt,
          endsAt,
        },
      })

      return res.status(204).send()
    },
  )
}
