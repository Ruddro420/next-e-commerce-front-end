import Container from "@/components/ui/Container";

export default function Footer() {
  return (
    <footer className="mt-14 bg-slate-950 text-slate-100">
      <Container className="py-12 grid md:grid-cols-3 lg:grid-cols-4 gap-10">
        {/* Support */}
        <div>
          <div className="tracking-[0.25em] text-xs font-bold opacity-80">
            SUPPORT
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 p-5">
            <div className="text-xs opacity-70">9 AM - 8 PM</div>
            <div className="mt-1 text-3xl font-extrabold text-orange-400">
              16793
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 p-5">
            <div className="text-xs opacity-70">Store Locator</div>
            <div className="mt-1 text-xl font-extrabold text-orange-400">
              Find Our Stores
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <div className="tracking-[0.25em] text-xs font-bold opacity-80">
            ABOUT US
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li><a className="hover:text-white" href="#">Affiliate Program</a></li>
            <li><a className="hover:text-white" href="#">Online Delivery</a></li>
            <li><a className="hover:text-white" href="#">Refund and Return Policy</a></li>
            <li><a className="hover:text-white" href="#">Blog</a></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <div className="tracking-[0.25em] text-xs font-bold opacity-80">
            POLICIES
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li><a className="hover:text-white" href="#">EMI Terms</a></li>
            <li><a className="hover:text-white" href="#">Privacy Policy</a></li>
            <li><a className="hover:text-white" href="#">Star Point Policy</a></li>
            <li><a className="hover:text-white" href="#">Contact Us</a></li>
          </ul>
        </div>

        {/* Stay connected */}
        <div>
          <div className="tracking-[0.25em] text-xs font-bold opacity-80">
            STAY CONNECTED
          </div>

          <div className="mt-4 text-sm text-slate-300 space-y-2">
            <div className="font-bold text-white">Star Tech Ltd</div>
            <div>
              Head Office : 28 Kazi Nazrul Islam Ave, Navana Zohura Square, Dhaka 1000
            </div>

            <div className="pt-2">
              <div className="text-xs opacity-70">Email:</div>
              <div className="text-orange-400 font-semibold">
                webteam@startechbd.com
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20" href="#">💬</a>
            <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20" href="#">f</a>
            <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20" href="#">▶</a>
            <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20" href="#">⌁</a>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-slate-400">
            Experience our App on your mobile:
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl border border-white/10 px-4 py-2 text-sm">
              Google Play
            </div>
            <div className="rounded-xl border border-white/10 px-4 py-2 text-sm">
              App Store
            </div>
          </div>
          <div className="text-xs text-slate-500">
            © 2026 Star Tech Ltd | All rights reserved
          </div>
        </Container>
      </div>
    </footer>
  );
}
