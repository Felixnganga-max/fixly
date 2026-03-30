import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getAllListings } from "../Hooks/marketplaceApi";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MarketplaceShowcase() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllListings({ limit: 50, page: 1 })
      .then((res) => setProducts(shuffle(res.data || []).slice(0, 8)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-beige py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2
            className="font-display font-extrabold text-2xl sm:text-3xl"
            style={{ color: "#0D1117" }}
          >
            Featured Devices
          </h2>
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-black transition-colors"
          >
            View more <ArrowRight size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-beige-dark rounded-2xl animate-pulse aspect-[3/4]"
              />
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/product/${p._id}`)}
                className="group bg-white border border-beige-dark rounded-2xl overflow-hidden cursor-pointer hover:border-green hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Image */}
                <div className="w-full aspect-square bg-beige overflow-hidden">
                  <img
                    src={p.images?.[0] || ""}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-1">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">
                    {p.brand}
                  </p>
                  <h3
                    className="font-display font-bold text-sm leading-snug line-clamp-2"
                    style={{ color: "#0D1117" }}
                  >
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <p
                      className="font-mono font-extrabold text-base"
                      style={{ color: "#0D1117" }}
                    >
                      KES {p.price?.toLocaleString()}
                    </p>
                    {p.verified && (
                      <ShieldCheck
                        size={15}
                        className="text-green-600"
                        strokeWidth={2}
                      />
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">{p.condition}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
