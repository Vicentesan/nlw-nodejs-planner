import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { dayjs } from '../lib/dayjs'
import { prisma } from '../lib/prisma'
import { ClientError } from '../errors/client-error'

export async function fetchActivities(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/activities',
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
        response: {
          200: z.object({
            activities: z
              .object({
                date: z.date(),
                activities: z
                  .object({
                    id: z.string().uuid(),
                    title: z.string(),
                    occursAt: z.date(),
                  })
                  .array(),
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
          activities: {
            select: {
              id: true,
              title: true,
              occursAt: true,
            },
            orderBy: { occursAt: 'asc' },
          },
        },
      })

      if (!trip) throw new ClientError('Trip not found')

      const diffInDaysBetweenTripStartAndEndDates = dayjs(trip.endsAt).diff(
        dayjs(trip.startsAt),
        'days'
      )

      // + 1 because we want to include the start date
      const activities = Array.from({
        length: diffInDaysBetweenTripStartAndEndDates + 1,
      }).map((_, i) => {
        const date = dayjs(trip.startsAt).add(i, 'days')

        return {
          date: date.toDate(),
          activities: trip.activities.filter((a) =>
            dayjs(a.occursAt).isSame(date, 'day')
          ),
        }
      })

      return res.status(200).send({ activities })
    }
  )
}
