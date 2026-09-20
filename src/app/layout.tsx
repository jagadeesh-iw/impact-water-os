import './globals.css';
import type { Metadata } from 'next';
export const metadata:Metadata={title:'Impact Water OS',description:'Impact Water E-commerce & Growth Operating System'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
