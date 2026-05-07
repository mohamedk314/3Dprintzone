import Link from "next/link";

export default function RaykFooter() {
  return (
    <footer className="bg-black text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="text-2xl font-bold tracking-[0.3em] uppercase mb-4">RAYK</p>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Premium fashion and lifestyle. Crafted for those who move differently.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">Shop</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/rayk/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/rayk/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link href="/rayk/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">Help</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/rayk/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">3Dprintzone</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/30 tracking-wide">
          <p>&copy; {new Date().getFullYear()} RAYK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
