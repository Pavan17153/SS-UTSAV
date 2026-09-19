"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    ExternalLink,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import { publicApi, API_BASE_URL } from "@/lib/api";

interface LegalDocument {
    id: number;
    document_type: string;
    title: string;
    content: string;
    source_type: "TEXT" | "FILE" | "URL";
    source_url: string | null;
    file_url: string | null;
    file_name: string | null;
    is_published: boolean;
    version: number;
    created_at: string;
    updated_at: string;
    published_at: string | null;
}

/*
|--------------------------------------------------------------------------
| DEFAULT SS UTSAV PRIVACY INFORMATION
|--------------------------------------------------------------------------
|
| This is fallback website content.
| When admin publishes a legal document, the published
| document automatically replaces this content.
|
*/

const DEFAULT_PRIVACY_POLICY = `
SS UTSAV Privacy Policy

Last Updated: September 2026

SS UTSAV ("we", "us", "our") respects your privacy and is committed to
handling information shared with us responsibly.

This Privacy Policy explains how information may be collected and used
when you visit our website, contact us, request event services, or
communicate with our team.

1. Information We May Collect

Depending on how you interact with SS UTSAV, we may collect information
such as:

• Name
• Phone number
• Email address
• Event type
• Preferred event date
• Event location
• Approximate guest count
• Budget or service requirements
• Messages and enquiries submitted through our website
• Information you voluntarily provide when communicating with our team

We only request information that is relevant to providing or discussing
our event-management services.

2. How We Use Information

Information provided to SS UTSAV may be used to:

• Respond to enquiries and requests.
• Understand your event requirements.
• Prepare quotations and proposals.
• Communicate regarding event planning and services.
• Coordinate services related to an event.
• Improve our website and customer experience.
• Maintain business and service records.
• Communicate important information relating to your enquiry or booking.

3. Communication

If you contact SS UTSAV through forms, phone, WhatsApp, email, or other
available communication channels, the information you provide may be
used by our team to respond to your enquiry and provide requested
services.

4. Sharing of Information

SS UTSAV may need to share relevant information with service providers,
vendors, venues, or other parties involved in delivering an event.

Information shared will be limited to what is reasonably necessary for
the relevant service or coordination.

We do not intend to sell personal information to third parties.

5. Payments

Where payments are made through third-party payment providers, payment
information may be processed by those providers according to their own
privacy policies and terms.

SS UTSAV may retain transaction-related information necessary for
business records, accounting, and service management.

6. Website and Cookies

Our website may use basic technical information, cookies, analytics, or
similar technologies where required to operate, secure, or improve the
website.

You can control cookies through your browser settings where applicable.

7. Data Security

SS UTSAV takes reasonable measures to protect information handled by
our business.

However, no internet transmission or electronic storage system can be
guaranteed to be completely secure.

8. Data Retention

We may retain information for as long as reasonably necessary to handle
your enquiry, provide services, maintain business records, meet legal
obligations, or resolve disputes.

9. Your Requests

You may contact SS UTSAV regarding information you have provided to us,
including requests relating to access, correction, or deletion where
applicable.

Requests can be made using the contact details published on our website.

10. Children's Information

Our website and services are not intentionally designed to collect
personal information from children independently.

If information concerning a child is required for an event, it should be
provided by or with the involvement of an appropriate parent, guardian,
or responsible adult.

11. Changes to This Privacy Policy

SS UTSAV may update this Privacy Policy when our services, website,
technology, or legal requirements change.

The latest version published on this page will represent the current
website policy.

12. Contact

If you have questions about this Privacy Policy or how SS UTSAV handles
information, please contact us through the contact details available on
our website.

This default website information is provided as a general website
privacy notice. The final legal Privacy Policy should be reviewed and
approved by an appropriate legal professional before production use.
`;


export default function PrivacyPolicyPage() {
    const [document, setDocument] =
        useState<LegalDocument | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [usingDefault, setUsingDefault] =
        useState(false);

    useEffect(() => {
        const fetchPrivacyPolicy = async () => {
            try {
                const data =
                    await publicApi.get<LegalDocument>(
                        "/api/legal/public/PRIVACY_POLICY"
                    );

                if (!data.is_published) {
                    setUsingDefault(true);
                    return;
                }

                setDocument(data);
                setUsingDefault(false);
            } catch (error) {
                setUsingDefault(true);

            } finally {
                setLoading(false);
            }
        };

        fetchPrivacyPolicy();
    }, []);

    return (
        <div className="min-h-screen bg-[#FBF7F0]">

            {/* =================================================
                HERO
            ================================================= */}

            <section className="border-b border-[#D6A928]/20 bg-[#39030F] px-5 py-20 text-center sm:px-8 lg:py-24">

                <div className="mx-auto max-w-4xl">

                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D6A928]">
                        Legal
                    </p>

                    <h1
                        className="mt-4 text-4xl font-semibold text-[#FBF7F0] sm:text-5xl lg:text-6xl"
                        style={{
                            fontFamily:
                                "Georgia, serif",
                        }}
                    >
                        Privacy Policy
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#FBF7F0]/70 sm:text-base">
                        Learn how SS UTSAV handles information
                        shared through our website and event
                        services.
                    </p>

                </div>

            </section>

            {/* =================================================
                CONTENT
            ================================================= */}

            <section className="px-5 py-12 sm:px-8 lg:px-10 lg:py-16">

                <div className="mx-auto max-w-5xl">

                    {loading && (
                        <div className="flex min-h-[400px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#D6A928]" />
                        </div>
                    )}

                    {!loading && (

                        <div className="rounded-2xl border border-[#D6A928]/20 bg-white shadow-sm">

                            {/* =================================================
                                DOCUMENT HEADER
                            ================================================= */}

                            <div className="border-b border-gray-100 px-6 py-7 sm:px-10">

                                <div className="flex items-start gap-4">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#39030F] text-[#D6A928]">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>

                                    <div>

                                        <h2
                                            className="text-2xl font-semibold text-[#39030F]"
                                            style={{
                                                fontFamily:
                                                    "Georgia, serif",
                                            }}
                                        >
                                            {document
                                                ? document.title
                                                : "SS UTSAV Privacy Policy"}
                                        </h2>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {document
                                                ? `Version ${document.version}`
                                                : "Website Privacy Information"}
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                DEFAULT CONTENT
                            ================================================= */}

                            {usingDefault && (

                                <div className="px-6 py-8 sm:px-10 sm:py-10">

                                    <div className="mb-6 rounded-xl border border-[#D6A928]/20 bg-[#FBF7F0] px-5 py-4">

                                        <div className="flex items-start gap-3">

                                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#D6A928]" />

                                            <div>

                                                <p className="text-sm font-semibold text-[#39030F]">
                                                    SS UTSAV Privacy Information
                                                </p>

                                                <p className="mt-1 text-xs leading-6 text-gray-600">
                                                    This is the current website
                                                    privacy information. A
                                                    finalized policy may be
                                                    published and managed by
                                                    the SS UTSAV administrator.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="whitespace-pre-wrap text-sm leading-8 text-gray-700 sm:text-[15px]">
                                        {
                                            DEFAULT_PRIVACY_POLICY
                                        }
                                    </div>

                                </div>

                            )}

                            {/* =================================================
                                ADMIN TEXT CONTENT
                            ================================================= */}

                            {!usingDefault &&
                                document?.source_type ===
                                "TEXT" && (

                                    <div className="px-6 py-8 sm:px-10 sm:py-10">

                                        <div className="whitespace-pre-wrap text-sm leading-8 text-gray-700 sm:text-[15px]">
                                            {
                                                document.content
                                            }
                                        </div>

                                    </div>
                                )}

                            {/* =================================================
                                ADMIN URL
                            ================================================= */}

                            {!usingDefault &&
                                document?.source_type ===
                                "URL" && (

                                    <div className="px-6 py-14 text-center sm:px-10">

                                        <LinkIconPlaceholder />

                                        <h3 className="mt-5 text-lg font-semibold text-[#39030F]">
                                            Privacy Policy
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-gray-600">
                                            Our Privacy Policy is
                                            available through the
                                            following link.
                                        </p>

                                        {document.source_url && (
                                            <a
                                                href={
                                                    document.source_url
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#39030F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0618]"
                                            >
                                                View Privacy Policy

                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}

                                    </div>
                                )}

                            {/* =================================================
                                ADMIN FILE
                            ================================================= */}

                            {!usingDefault &&
                                document?.source_type ===
                                "FILE" && (

                                    <div className="px-6 py-14 text-center sm:px-10">

                                        <FileText className="mx-auto h-12 w-12 text-[#D6A928]" />

                                        <h3 className="mt-5 text-lg font-semibold text-[#39030F]">
                                            {document.file_name ||
                                                "Privacy Policy Document"}
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-gray-600">
                                            The current SS UTSAV
                                            Privacy Policy is
                                            available in the
                                            published document.
                                        </p>

                                        {document.file_url && (
                                            <a
                                                href={`${API_BASE_URL}${document.file_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#39030F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0618]"
                                            >
                                                Open Document

                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}

                                    </div>
                                )}

                        </div>

                    )}

                </div>

            </section>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Small URL icon component
|--------------------------------------------------------------------------
*/

function LinkIconPlaceholder() {
    return (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#39030F] text-[#D6A928]">
            <ExternalLink className="h-6 w-6" />
        </div>
    );
}