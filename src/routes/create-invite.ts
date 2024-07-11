import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { dayjs } from '../lib/dayjs'
import { env } from '../env'
import { resend } from '../lib/mailer'

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/invites',
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (req, res) => {
      const { tripId } = req.params
      const { email } = req.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) throw new Error('Trip not found')

      const participant = await prisma.participant.create({
        data: {
          email: email.toLowerCase(),
          tripId,
        },
      })

      const formattedStartDate = dayjs(trip.startsAt).format('LL')
      const formattedEndDate = dayjs(trip.endsAt).format('LL')

      const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`

      await resend.emails.send({
        from: 'Plann.er <onboarding@resend.dev>',
        subject: `[Plann.er] Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
        to: participant.email.toLowerCase(), // it will only send to other people if you use your own domain on https://resend.com
        html: `
            <div style="font-family: sans-serif font-size: 16px line-height: 1.6">
              <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
              <p></p>
              <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
              <p></p>
              <p>
                <a href="${confirmationLink}">Confirmar viagem</a>
              </p>
              <p></p>
              <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
            </div>
          `.trim(),
      })

      return res.status(204).send()
    }
  )
}
