import { Container } from "@/components/ui/container";
import { Rating } from "@/components/ui/rating";
import { reviews } from "@/lib/mock-data";

export function ReviewsSection() {
  return (
    <section>
      <Container className="py-14 sm:py-20">
        <h2 className="text-foreground mb-8 text-2xl font-bold">
          Avaliações de clientes
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="border-border flex flex-col gap-3 rounded-xl border p-5"
            >
              <Rating value={review.rating} />
              <p className="text-foreground text-sm">{review.comment}</p>
              <div className="text-muted-foreground mt-auto text-xs">
                <p className="text-foreground font-medium">{review.author}</p>
                <p>{review.productName}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
