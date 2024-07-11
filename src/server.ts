import cors from '@fastify/cors'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { confirmParticipation } from './routes/confirm-participation'
import { confirmTrip } from './routes/confirm-trip'
import { createActivity } from './routes/create-activity'
import { createInvite } from './routes/create-invite'
import { createLink } from './routes/create-link'
import { createTrip } from './routes/create-trip'
import { fetchActivities } from './routes/fetch-activities'
import { fetchLinks } from './routes/fetch-links'
import { fetchParticipants } from './routes/fetch-participants'
import { getTripDetails } from './routes/get-trip-details'
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
app.register(getTripDetails)

app.listen({ port: 3333 }).then(() => console.log('HTTP server running'))
