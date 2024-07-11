import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { ClientError } from '../errors/client-error'
import { dayjs } from '../lib/dayjs'
import { prisma } from '../lib/prisma'

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/activities',
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
        body: z.object({
          title: z.string().min(4),
          occursAt: z.coerce.date(),
        }),
        response: {
          201: z.object({
            activityId: z.string().uuid(),
          }),
        },
      },
    },
    async (req, res) => {
      const { tripId } = req.params
      const { title, occursAt } = req.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) throw new ClientError('Trip not found')

      if (
        dayjs(occursAt).isBefore(dayjs(trip.startsAt)) ||
        dayjs(occursAt).isAfter(dayjs(trip.endsAt))
      )
        throw new ClientError('Invalid activity date')

      const activity = await prisma.activity.create({
        data: {
          tripId,
          title,
          occursAt,
        },
      })

      return res.status(201).send({ activityId: activity.id })
    },
  )
}
