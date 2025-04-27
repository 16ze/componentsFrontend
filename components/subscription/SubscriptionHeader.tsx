interface SubscriptionHeaderProps {
  title: string;
  description: string;
}

export default function SubscriptionHeader({
  title,
  description,
}: SubscriptionHeaderProps) {
  return (
    <div className="text-center space-y-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="text-lg text-muted-foreground">{description}</p>
    </div>
  );
}
