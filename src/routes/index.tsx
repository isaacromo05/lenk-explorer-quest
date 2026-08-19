import { createFileRoute } from "@tanstack/react-router";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Medal,
  Text,
} from "@/design-system";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lenk Explorer Quest — Design System Showcase" },
      {
        name: "description",
        content:
          "Colors, typography, and components of the Lenk Explorer Quest alpine design system.",
      },
      { property: "og:title", content: "Lenk Explorer Quest — Design System Showcase" },
      {
        property: "og:description",
        content: "Alpine tokens, pill badges, gold reward medals, and rounded surfaces.",
      },
    ],
  }),
  component: Showcase,
});

const swatches = [
  { name: "Primary", token: "bg-primary", hint: "Headers, primary buttons, navbar" },
  { name: "Secondary", token: "bg-secondary", hint: "Trail badges, success, nature" },
  { name: "Gold", token: "bg-gold", hint: "Unlocked medals & rewards only" },
  { name: "Background", token: "bg-background", hint: "Page canvas" },
  { name: "Surface", token: "bg-surface", hint: "Cards & modals" },
  { name: "Text", token: "bg-text", hint: "Primary copy" },
];

const sectors = ["Water", "Summit", "Culture"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <Heading as="h2" level={3}>
        {title}
      </Heading>
      {children}
    </section>
  );
}

function Showcase() {
  return (
    <main className="min-h-screen bg-background">
      <header className="bg-primary px-6 py-10 text-primary-foreground sm:px-10">
        <div className="mx-auto max-w-5xl space-y-3">
          <Badge variant="gold">Design System</Badge>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Lenk Explorer Quest
          </h1>
          <Text tone="inverse" className="max-w-xl opacity-90">
            Alpine blues, forest greens, and gold reserved for earned rewards — built for
            readability on the trail.
          </Text>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-12 px-6 py-12 sm:px-10">
        <Section title="Color tokens">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {swatches.map((s) => (
              <Card key={s.name} className="overflow-hidden">
                <div className={`h-20 w-full ${s.token}`} />
                <CardContent className="pt-4">
                  <p className="font-display font-bold text-primary">{s.name}</p>
                  <Text tone="muted" size="sm">
                    {s.hint}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Heading as="h3" level={1}>
                Summit the Wildstrubel
              </Heading>
              <Heading as="h4" level={2}>
                Trail heading, bold and modern
              </Heading>
              <Text>
                Body copy uses Plus Jakarta Sans with relaxed line-height so route notes stay
                readable in bright sunlight.
              </Text>
              <Text tone="muted" size="sm">
                Muted supporting text for metadata and hints.
              </Text>
            </CardContent>
          </Card>
        </Section>

        <Section title="Buttons">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 pt-6">
              <Button>Start quest</Button>
              <Button variant="secondary">Mark complete</Button>
              <Button variant="gold">Claim reward</Button>
              <Button variant="outline">Details</Button>
              <Button variant="ghost">Skip</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
            </CardContent>
          </Card>
        </Section>

        <Section title="Badges">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 pt-6">
              {sectors.map((s) => (
                <Badge key={s} variant="trail" size="md">
                  {s}
                </Badge>
              ))}
              <Badge variant="primary">Level 4</Badge>
              <Badge variant="gold">Premium</Badge>
              <Badge variant="outline">Draft</Badge>
              <Badge>Neutral</Badge>
            </CardContent>
          </Card>
        </Section>

        <Section title="Medals">
          <Card>
            <CardContent className="flex flex-wrap gap-8 pt-6">
              <Medal label="Summit Master" />
              <Medal label="Lake Walker" />
              <Medal label="Culture Trail" locked />
            </CardContent>
          </Card>
        </Section>

        <Section title="Cards & forms">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>Simmefälle Trail</CardTitle>
                  <Badge variant="trail">Water</Badge>
                </div>
                <CardDescription>
                  4.2 km along the gorge, with three checkpoints and a waterfall viewpoint.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button size="sm">Start quest</Button>
                <Button size="sm" variant="outline">
                  Route map
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join the quest</CardTitle>
                <CardDescription>Explorer name and code from your trail pass.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="explorer" className="text-sm font-semibold text-text">
                    Explorer name
                  </label>
                  <Input id="explorer" placeholder="Anna from Lenk" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="code" className="text-sm font-semibold text-text">
                    Quest code
                  </label>
                  <Input id="code" placeholder="LENK-2026" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm">
                  Join
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Section>
      </div>
    </main>
  );
}