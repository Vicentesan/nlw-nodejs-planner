import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { dayjs } from '../lib/dayjs'
import { prisma } from '../lib/prisma'

export async function fetchActivities(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
    schema: {
      params: z.object({ tripId: z.string().uuid() }),
      response: {
        200: z.object({
          activities: z.object({
            id: z.string().uuid(),
            title: z.string(),
            occursAt: z.date(),
          }).array()
        })
      }
    }
  }, async (req, res) => {
    const { tripId } = req.params

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { activities: true }
    })

    if (!trip)
      throw new Error('Trip not found')

    return res.status(201).send({ activities: trip.activities })
  })
}