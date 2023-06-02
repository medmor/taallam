import '../styles/globals.css'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'تعلم',
  description: 'تعلم للابتدائي',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="bg-green-500 h-full">
          {children}
        </div>
        <Footer></Footer>
      </body>
    </html>
  )
}
