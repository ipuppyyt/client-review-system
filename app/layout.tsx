import * as fonts from "@fonts";
import { meta, view } from "@meta";
import "@styles/globals.css";
import { Providers } from "./providers";

export const metadata = meta;
export const viewport = view;

interface RootLayoutProps {
  children: React.ReactNode;
}

const fontVariables = Object.values(fonts)
  .map((font) => font.variable)
  .join(" ");

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" data-theme="business" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
