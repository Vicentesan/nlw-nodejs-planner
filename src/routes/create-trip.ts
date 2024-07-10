import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { resend } from '../lib/mailer'
import { env } from '../env'
import { dayjs } from '../lib/dayjs'

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips', {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date(),
        ownerName: z.string(),
        ownerEmail: z.string().email(),
        emailsToInvite: z.string().email().array()/*.optional()*/,
      }),
      response: {
        201: z.object({
          tripId: z.string().uuid()
        })
      }
    }
  }, async (req, res) => {
    const { destination, startsAt, endsAt, ownerName, ownerEmail, emailsToInvite } = req.body

    if (dayjs(startsAt).isBefore(new Date())) 
      throw new Error('Invalid start trip date.')

    if (dayjs(endsAt).isBefore(startsAt))
      throw new Error('Invalid end trip date.')

    const trip = await prisma.trip.create({
      data: {
        destination,
        startsAt,
        endsAt,
        participants: {
          createMany: {
            data: [
              {
                email: ownerEmail.toLowerCase(),
                name: ownerName,
                isOwner: true,
                isConfirmed: true,
              },
              ...emailsToInvite.map(email => {
                return {
                  email: email.toLowerCase(),
                }
              })
            ]
          } 
        }
      }
    })

    const formattedStartDate = dayjs(startsAt).format('LL')
    const formattedEndDate = dayjs(endsAt).format('LL')

    const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`

    await resend.emails.send({
      from: 'Plann.er <onboarding@resend.dev>',
      to: ownerEmail.toLowerCase(),
      subject: `[Plann.er] Confirme sua viagem para ${destination} em ${formattedStartDate}!`,
      html: `
      <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>Para confirmar sua viagem, clique no link abaixo:</p>
          <p></p>
          <p>
            <a href="${confirmationLink}">Confirmar viagem</a>
          </p>
          <p></p>
          <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
        </div>
      `.trim()
    })

    return res.status(201).send({ tripId: trip.id })
  })
}