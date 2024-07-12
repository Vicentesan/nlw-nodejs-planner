import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { ClientError } from '@/errors/client-error'
import { prisma } from '@/lib/prisma'

export async function confirmParticipation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/participants/:participantId/confirm',
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (req, res) => {
      const { participantId } = req.params
      const { name, email } = req.body

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
          email,
        },
      })

      if (!participant) throw new ClientError('Participant not found.')

      if (participant.isConfirmed && participant.name === name) return

      await prisma.participant.update({
        where: {
          id: participantId,
        },
        data: {
          email,
          name,
          isConfirmed: true,
        },
      })

      return res.status(204).send()
    },
  )
}
