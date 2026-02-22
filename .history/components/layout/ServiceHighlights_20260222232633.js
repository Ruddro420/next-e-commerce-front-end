"use client";

import Container from "@/components/ui/Container";
import {
  Truck,
  RefreshCcw,
  CreditCard,
  Shirt,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";

export default function ServiceHighlights() {
  const items = [
    {
      icon: Truck,
      title: "FREE\nDELIVERY",
      desc: "Free delivery over\n1000 BDT shopping.",
    },
    {
      icon: RefreshCcw,
      title: "EASY Policies",
      desc: "Delivery/Return in easy way",
    },
    {
      icon: CreditCard,
      title: "Secure\nPayment",
      desc: "COD/bKash/Cards",
    },
    {
      icon: Shirt,
      title: "Over Thousands Styles",
      desc: "Everything you need",
    },
  ];

  return (
    <section className="bg-white">
      <Container className="py-10">
        {/* Top 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((it, idx) => {
            const Icon = it.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAFAFA] rounded-md border border-transparent shadow-[0_0_0_0_rgba(0,0,0,0)]"
              >
                <div className="min-h-[150px] flex items-center gap-6 px-8 py-10">
                  <div className="shrink-0 text-slate-300">
                    <Icon className="w-14 h-14" strokeWidth={1.5} />
                  </div>

                  <div className="min-w-0">
                    <div className="text-[#2E7D32] font-extrabold leading-tight text-xl whitespace-pre-line">
                      {it.title}
                    </div>
                    <div className="mt-3 text-slate-500 text-sm leading-relaxed whitespace-pre-line">
                      {it.desc}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Follow us */}
        <div className="mt-12 flex items-center justify-center gap-6">
          <div className="text-[#2E7D32] font-extrabold tracking-wide text-sm">
            FOLLOW US
          </div>
          <div className="h-px w-14 bg-slate-300" />

          <div className="flex items-center gap-4">
            <SocialIcon href="#" label="Facebook">
              <Facebook className="w-5 h-5" />
            </SocialIcon>
            <SocialIcon href="#" label="Instagram">
              <Instagram className="w-5 h-5" />
            </SocialIcon>
            <SocialIcon href="#" label="Twitter">
              <Twitter className="w-5 h-5" />
            </SocialIcon>
            <SocialIcon href="#" label="YouTube">
              <Youtube className="w-5 h-5" />
            </SocialIcon>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="w-10 h-10 rounded-sm bg-slate-600 hover:bg-slate-700 transition flex items-center justify-center text-white"
    >
      {children}
    </Link>
  );
}