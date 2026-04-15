import { Geist, Geist_Mono, Open_Sans, Nunito, Nunito_Sans } from "next/font/google";

export const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
export const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
export const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
export const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans" });