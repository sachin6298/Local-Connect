import { Star, Quote, CheckCircle2, MapPin } from "lucide-react";

export function Testimonials() {
  const reviews = [
    {
      name: "Ramesh Kumar",
      role: "Pilgrim Renter",
      city: "Bangalore",
      text: "Came for Pind-daan rituals with my elderly parents. Instead of hauling three heavy brass thalis and new cotton dhotis from Bangalore, Sharma Ji handed over freshly sanitized items right outside Gaya Junction. Saved us luggage stress and over ₹2,000.",
      rating: 5,
      item: "Rented: White Dhoti Set + Puja Thali",
      avatarBg: "from-blue-500 to-indigo-600",
    },
    {
      name: "Radhe Mohan Sharma",
      role: "Verified Local Host",
      city: "Vishnupad, Gaya",
      text: "We had multiple consecrated brass items and ceremony dhotis sitting in our wardrobes. Through LocalConnect, they earned over ₹7,500 during Pitru Paksha. The photo verification ensures our items come back in perfect shape every time.",
      rating: 5,
      item: "Superhost · 38 Rentals Completed",
      avatarBg: "from-teal to-emerald-600",
    },
    {
      name: "Ananya Deshmukh",
      role: "Backpacker Explorer",
      city: "Pune",
      text: "I needed a 40L technical rucksack for a short 3-day heritage trail. Instead of buying a new backpack for ₹3,500, I rented Asha Ji's well-maintained bag for ₹60 a day. Sustainable, economical, and warm local hospitality!",
      rating: 5,
      item: "Rented: 40L Durable Rucksack",
      avatarBg: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">COMMUNITY VOICES</span>
          <h2 className="section-title mt-2">
            Loved By Pilgrims, Backers & Host Families
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-500">
            Read real stories of convenient travels and dependable neighborhood earnings.
          </p>
        </div>

        {/* Reviews Cards */}
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {reviews.map((r, i) => (
            <div
              key={r.name}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-paper p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:bg-white hover:shadow-card-hover"
            >
              <div>
                {/* Rating stars & Quote icon */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote size={20} className="text-slate-300 group-hover:text-brand-400 transition-colors" />
                </div>

                <p className="mt-5 text-xs leading-relaxed text-slate-600 font-medium">
                  "{r.text}"
                </p>
              </div>

              <div className="mt-6 border-t border-slate-200/60 pt-4">
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr ${r.avatarBg} text-xs font-bold text-white shadow-sm`}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-ink">{r.name}</span>
                      <CheckCircle2 size={12} className="text-teal" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <MapPin size={10} /> {r.city} · <span className="text-brand-600 font-bold">{r.role}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-slate-100/80 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                  {r.item}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

