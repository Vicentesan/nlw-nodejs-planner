import fastify from 'fastify'
import cors from '@fastify/cors'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { createTrip } from './routes/create-trip'
import { confirmTrip } from './routes/confirm-trip'
import { confirmParticipation } from './routes/confirm-participation'
import { createActivity } from './routes/create-activity'
import { fetchActivities } from './routes/fetch-activities'
import { createLink } from './routes/create-link'
import { fetchLinks } from './routes/fetch-links'
import { fetchParticipants } from './routes/fetch-participants'
import { createInvite } from './routes/create-invite'
import { updateTrip } from './routes/update-trip'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createTrip)
app.register(confirmTrip)
app.register(confirmParticipation)
app.register(createActivity)
app.register(fetchActivities)
app.register(createLink)
app.register(fetchLinks)
app.register(fetchParticipants)
app.register(createInvite)
app.register(updateTrip)

app.listen({ port: 3333 }).then(() => console.log('HTTP server running'))
