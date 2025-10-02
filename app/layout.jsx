import { Jost, Marcellus } from 'next/font/google'
import './globals.css'
import SvgDefs from './components/SvgDefs'

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--bs-body-font-family',
})

const marcellus = Marcellus({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--heading-font',
})

export const metadata = {
  title: 'Pradii - Fashion Store',
  description: 'Next.js conversion of Kaira Fashion Store Template',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${jost.variable} ${marcellus.variable} font-body`}>
        {/* SvgDefs can stay here as they might be needed globally */}
        <SvgDefs />
        {/* The children will be either the admin layout or the main site layout */}
        {children}
      </body>
    </html>
  )
}