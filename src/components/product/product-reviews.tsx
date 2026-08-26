import { Rating } from "@/components/ui/rating";
import type { Review } from "@/types/catalog";

export function ProductReviews({
  rating,
  reviewCount,
  reviews,
}: {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}) {
  return (
    <section id="avaliacoes" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-foreground text-xl font-bold">Avaliações</h2>
        {reviewCount > 0 && <Rating value={rating} reviewCount={reviewCount} />}
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Ainda não há avaliações escritas para este produto.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="border-border flex flex-col gap-2 rounded-xl border p-4"
            >
              <Rating value={review.rating} />
              <p className="text-foreground text-sm">{review.comment}</p>
              <p className="text-muted-foreground text-xs font-medium">
                {review.author}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
