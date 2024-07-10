import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

interface ConfirmTripTemplateProps {
  userEmail: string
  confirmationLink: string
}

export function ConfirmTripTemplate({
  userEmail,
  confirmationLink,
}: ConfirmTripTemplateProps) {
  const previewText = `Confirme seu viagem!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind key={`to-${userEmail}`}>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px] text-center">
              <span className="text-2xl">🗓️</span>
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Confirme seu planejamento de viagem no Plann-er
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Você criou um planejamento de uma viagem no Plann-er através do email{' '}
              {userEmail}.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-lime-500 rounded text-white px-5 py-3 text-[12px] font-semibold no-underline text-center hover:bg-lime-950 transition-all duration-200"
                href={confirmationLink}
              >
                Confirmar agora
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              ou copie a URL abaixo e cole em seu browser:{' '}
              <Link href={confirmationLink} className="text-lime-500 no-underline">
                {confirmationLink}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Se você não solicitou esse planejamento, apenas descarte
              esse e-mail.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
