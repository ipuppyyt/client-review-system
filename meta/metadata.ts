import { Metadata } from "next";

export const meta: Metadata = {
    title: {
        template: "%s | Client Review System",
        default: "Client Review System",
    },
    creator: 'Client Review System Team',
    publisher: 'Client Review System Team',
    description: 'Client Review System is a modern platform for client reviews.',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    robots: {
        index: false,
        follow: false,
        nocache: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
        },
    },
};