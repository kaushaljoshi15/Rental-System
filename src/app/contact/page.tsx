import ContactForm from "./contact-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | RentKart Support",
  description: "Get in touch with RentKart Support for rental inquiries, order updates, or technical assistance.",
  alternates: {
    canonical: "/contact",
  },
}

export default function ContactPage() {
  return <ContactForm />
}
