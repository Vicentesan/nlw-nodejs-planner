import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import dayjs from 'dayjs'
import { resend } from '../lib/mailer'

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips', {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date(),
        ownerName: z.string(),
        ownerEmail: z.string().email()
      }),
      response: {
        201: z.object({
          tripId: z.string().uuid()
        })
      }
    }
  }, async (req, res) => {
    const { destination, startsAt, endsAt, ownerName, ownerEmail } = req.body

    if (dayjs(startsAt).isBefore(new Date())) 
      throw new Error('Invalid start trip date.')

    if (dayjs(endsAt).isBefore(startsAt))
      throw new Error('Invalid end trip date.')

    const trip = await prisma.trip.create({
      data: {
        destination,
        startsAt,
        endsAt
      }
    })

    await resend.emails.send({
      from: 'Plann.er <onboarding@resend.dev>',
      to: ownerEmail.toLowerCase(),
      subject: 'Test',
      text: 'Test'
    })

    return res.status(201).send({ tripId: trip.id })
  })
}