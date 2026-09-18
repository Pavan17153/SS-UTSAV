"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    ExternalLink,
    Loader2,
    Scale,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const API_BASE_URL = "http://127.0.0.1:8000";

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
| DEFAULT SS UTSAV TERMS & CONDITIONS
|--------------------------------------------------------------------------
|
| This is fallback website content.
| When admin publishes a legal document, the published
| document automatically replaces this content.
|
*/

const DEFAULT_TERMS_AND_CONDITIONS = `
SS UTSAV Terms & Conditions

Last Updated: September 2026

These Terms & Conditions govern the use of the SS UTSAV website and
the event-management services provided by SS UTSAV ("we", "us", "our").

By using our website, submitting an enquiry, requesting a quotation,
or engaging our event-management services, you acknowledge that you
have read and understood these Terms & Conditions.

1. Website Use

The SS UTSAV website provides information about our event-management
services, packages, event planning solutions, and ways to contact our
team.

You agree to use the website only for lawful purposes and not to:

• Misuse the website or its services.
• Submit false or misleading information.
• Attempt to gain unauthorized access to our systems.
• Interfere with the operation or security of the website.
• Use website information for unlawful purposes.

2. Event Enquiries

When you submit an enquiry to SS UTSAV, you agree to provide accurate
and relevant information about your event requirements.

Information may include:

• Name
• Phone number
• Email address
• Event type
• Event date
• Event location
• Guest count
• Budget or service requirements
• Additional event requirements

Submitting an enquiry does not automatically create a confirmed booking.

Our team may contact you to understand your requirements and discuss
available services.

3. Quotations and Proposals

Any quotation or proposal provided by SS UTSAV may include information
such as:

• Services included
• Estimated pricing
• Event requirements
• Vendor or venue-related costs
• Applicable taxes
• Payment requirements
• Validity period

Unless specifically stated otherwise, a quotation is an estimate and
may change if event requirements, guest count, venue, services, dates,
or other circumstances change.

A booking is considered confirmed only after the applicable confirmation
requirements communicated by SS UTSAV have been completed.

4. Pricing

Prices may vary depending on:

• Event type
• Number of guests
• Venue
• Date and season
• Services selected
• Vendors involved
• Custom requirements
• Additional services requested

Applicable taxes, venue charges, vendor charges, transportation costs,
or other third-party expenses may be charged separately where
applicable.

5. Booking and Advance Payment

Certain events or services may require an advance payment to confirm
the booking.

The applicable advance amount, payment schedule, and balance payment
requirements will be communicated to the customer before confirmation.

A booking may not be considered confirmed until the required payment
and confirmation requirements have been completed.

6. Payment

Payments may be accepted through payment methods communicated by
SS UTSAV, which may include:

• Cash
• UPI
• Card
• Bank transfer
• Cheque
• Other approved payment methods

Customers should retain payment confirmations or transaction
references for their records.

7. Cancellation and Rescheduling

Cancellation and rescheduling terms may depend on:

• Date of cancellation
• Time remaining before the event
• Services already arranged
• Vendor commitments
• Venue commitments
• Non-refundable expenses
• Amounts already paid

Any applicable cancellation charges, refund amount, or rescheduling
conditions will be communicated based on the circumstances of the event.

Third-party vendor or venue cancellation policies may also apply.

8. Refunds

Refund eligibility depends on the specific booking, services involved,
payments already made, and applicable cancellation conditions.

Certain payments made toward vendors, venues, customized services,
materials, or other arrangements may be non-refundable.

Where a refund is applicable, the amount and method of refund will be
communicated to the customer.

9. Event Changes

Customers should inform SS UTSAV as soon as possible about significant
changes to:

• Event date
• Venue
• Guest count
• Event schedule
• Services
• Theme or design
• Other major requirements

Changes may affect availability, pricing, timelines, or vendor
arrangements.

10. Vendors and Third-Party Services

SS UTSAV may work with external vendors, venues, professionals, and
service providers to deliver event-related services.

Examples may include:

• Caterers
• Decorators
• Photographers
• Videographers
• DJs
• Artists
• Makeup professionals
• Venues
• Transportation providers
• Other event professionals

Third-party services may be subject to the respective provider's terms,
availability, pricing, and policies.

11. Customer Responsibilities

Customers are responsible for providing accurate information and
communicating important event requirements in a timely manner.

Customers should also:

• Provide accurate event details.
• Make required payments on time.
• Provide access to the venue where necessary.
• Obtain required permissions or approvals where applicable.
• Inform SS UTSAV about important changes.
• Cooperate with event planning and coordination requirements.

12. Event-Day Services

The scope of event-day coordination depends on the services included
in the customer's confirmed booking.

SS UTSAV will make reasonable efforts to coordinate agreed services and
vendors.

However, circumstances outside our reasonable control, including
vendor delays, venue restrictions, traffic, weather, public events,
technical problems, or other unexpected circumstances may affect event
execution.

13. Force Majeure

SS UTSAV will not be responsible for delays, interruptions, or inability
to perform services caused by circumstances beyond reasonable control.

Such circumstances may include:

• Natural disasters
• Severe weather
• Government restrictions
• Public emergencies
• Strikes
• Transportation disruptions
• Venue closure
• Power or communication failures
• Public health emergencies
• Other unforeseen circumstances

Where reasonably possible, SS UTSAV will communicate with the customer
and discuss available alternatives.

14. Photography and Media

Events may involve photography or videography by SS UTSAV or third-party
service providers.

Use of photographs, videos, or other event-related media for promotional
purposes will depend on the applicable customer agreement and permissions.

Customers may communicate any specific privacy or media restrictions
before the event.

15. Intellectual Property

Unless otherwise agreed, website content including text, branding,
logos, graphics, designs, images, and other materials associated with
SS UTSAV may be protected by applicable intellectual-property laws.

You may not reproduce, copy, modify, distribute, or commercially use
SS UTSAV materials without appropriate permission.

16. Website Information

We make reasonable efforts to keep website information accurate and
current.

However, service availability, pricing, packages, vendors, images,
descriptions, and other information may change without prior notice.

Website information should not be treated as a final quotation or
confirmed service agreement unless specifically stated.

17. Limitation of Responsibility

SS UTSAV will make reasonable efforts to provide the services agreed
with the customer.

However, SS UTSAV may not be responsible for losses, delays, or service
interruptions caused by circumstances outside our reasonable control
or by independent third-party service providers.

Any specific limitation of liability will be subject to the applicable
agreement and law.

18. Privacy

Information submitted through the SS UTSAV website or during the event
planning process may be handled according to our Privacy Policy.

You can review the Privacy Policy through the legal information provided
on our website.

19. Dispute Resolution

If a dispute arises regarding our services, the customer and SS UTSAV
will attempt to resolve the matter through communication and good-faith
discussion.

Where a dispute cannot be resolved informally, applicable legal
procedures and jurisdiction will apply according to the final agreement
between the parties and applicable law.

20. Changes to These Terms

SS UTSAV may update these Terms & Conditions when our services,
website, business practices, or legal requirements change.

The latest version published on this page will represent the current
website Terms & Conditions.

21. Contact

If you have questions about these Terms & Conditions or our event
services, please contact SS UTSAV using the contact details available
on our website.

These default Terms & Conditions are provided as general website
information. The final legal Terms & Conditions should be reviewed and
approved by an appropriate legal professional before production use.
`;


export default function TermsAndConditionsPage() {
    const [document, setDocument] =
        useState<LegalDocument | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [usingDefault, setUsingDefault] =
        useState(false);

    useEffect(() => {
        const fetchTermsAndConditions = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/legal/public/TERMS_AND_CONDITIONS`
                );

                if (!response.ok) {
                    /*
                     * No published document.
                     * Use default SS UTSAV content.
                     */
                    setUsingDefault(true);
                    return;
                }

                const data: LegalDocument =
                    await response.json();

                /*
                 * Safety check.
                 * Public API should only return published data.
                 */
                if (!data.is_published) {
                    setUsingDefault(true);
                    return;
                }

                setDocument(data);
                setUsingDefault(false);
            } catch (error) {
                console.error(
                    "Terms & Conditions fetch error:",
                    error
                );

                /*
                 * Backend unavailable or no published
                 * document → show default content.
                 */
                setUsingDefault(true);
            } finally {
                setLoading(false);
            }
        };

        fetchTermsAndConditions();
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
                        Terms & Conditions
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#FBF7F0]/70 sm:text-base">
                        Please review the terms that apply to
                        using the SS UTSAV website and our
                        event-management services.
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
                                        <Scale className="h-5 w-5" />
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
                                                : "SS UTSAV Terms & Conditions"}
                                        </h2>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {document
                                                ? `Version ${document.version}`
                                                : "Website Terms & Conditions"}
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

                                            <Scale className="mt-0.5 h-5 w-5 shrink-0 text-[#D6A928]" />

                                            <div>

                                                <p className="text-sm font-semibold text-[#39030F]">
                                                    SS UTSAV Terms & Conditions
                                                </p>

                                                <p className="mt-1 text-xs leading-6 text-gray-600">
                                                    These are the current
                                                    website Terms & Conditions.
                                                    Final terms may be published
                                                    and managed by the SS UTSAV
                                                    administrator.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="whitespace-pre-wrap text-sm leading-8 text-gray-700 sm:text-[15px]">
                                        {
                                            DEFAULT_TERMS_AND_CONDITIONS
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
                                            Terms & Conditions
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-gray-600">
                                            Our Terms & Conditions
                                            are available through
                                            the following link.
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
                                                View Terms & Conditions

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
                                                "Terms & Conditions Document"}
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-gray-600">
                                            The current SS UTSAV
                                            Terms & Conditions
                                            are available in the
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