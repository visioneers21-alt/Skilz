import Link from 'next/link'
import Image from 'next/image'
import {
  Compass,
  Target,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkilzLogo } from '@/components/skilz/logo'
import { StartCta } from '@/components/landing/start-cta'
import { LandingBottomBar } from '@/components/landing/landing-bottom-bar'
import { AuthHeaderActions } from '@/components/skilz/auth-header-actions'

const LANDING_IMAGES = {
  hero: '/landing/hero-students.png',
  studentJourney: '/landing/student-journey.png',
  careerExploration: '/landing/career-exploration.png',
} as const

const SL_PROBLEMS = [
  {
    problem: 'Limited exposure to different careers',
    solution:
      'Many students know popular jobs but have not tried activities in technology, engineering, entrepreneurship, media, or leadership. SKILZ helps you explore possibilities through practical mini-challenges.',
  },
  {
    problem: 'Career guidance is not always available',
    solution:
      'Not every school has consistent counselling. SKILZ gives you a structured way to discover areas of potential and discuss them with teachers, family, or mentors.',
  },
  {
    problem: 'Choosing subjects or paths without knowing your strengths',
    solution:
      'Students often pick WAEC subjects, courses, or career ideas based on friends, family, or what seems prestigious — not what fits their interests and strengths. SKILZ helps you explore first.',
  },
  {
    problem: 'Talent hidden because it was never tested',
    solution:
      'You might be strong in an area you have never had the chance to try. Discovery plus practical challenges gives you evidence to learn about yourself — not a final verdict.',
  },
]

const STEPS = [
  {
    icon: Compass,
    title: 'Discover',
    body: 'Answer 20 scenario-based questions about school life, interests, and problem-solving. SKILZ narrows 150+ areas to your best potential matches.',
  },
  {
    icon: Target,
    title: 'Test it',
    body: 'Try practical mini-challenges — logic, creativity, leadership, communication — to see how an area feels when you actually do it.',
  },
  {
    icon: Sparkles,
    title: 'Understand',
    body: 'SKILZ combines your discovery answers, challenge results, and reflection into a clear picture of what you might enjoy developing.',
  },
  {
    icon: TrendingUp,
    title: 'Explore & develop',
    body: 'See possible career directions, school clubs, starter projects, and a step-by-step plan you can actually follow.',
  },
]

const DEMO_STEPS = [
  'Uncertain about what fits them',
  'Completes the 20-question discovery quest',
  'Sees areas of potential — not a fixed label',
  'Tries a practical mini-challenge',
  'Reflects: "I enjoyed this — I want to try more"',
  'Explores possible paths in technology and problem-solving',
  'Gets a development plan: join STEM club, build a project, talk to a mentor',
]

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <SkilzLogo />
        <AuthHeaderActions />
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 md:pt-16 lg:pb-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <MapPin className="size-3.5 text-primary" />
                Built for young people in Sierra Leone · exploration, not diagnosis
              </span>
              <h1 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
                What am I good at, what do I enjoy, and what could I explore next?
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg lg:mx-0">
                SKILZ is an AI-assisted talent and career exploration platform that helps secondary-school
                students discover areas of potential, test interests through practical challenges, and find
                realistic pathways for developing those skills.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <StartCta className="w-full sm:w-auto" />
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link href="#why-it-matters">Why this matters</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Discover → test → understand → explore → develop · potential, not verdicts
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_18px_40px_-24px_rgba(30,20,80,0.35)]">
                <Image
                  src={LANDING_IMAGES.hero}
                  alt="Illustration of Sierra Leonean secondary students exploring learning, STEM, and career possibilities together"
                  width={1200}
                  height={675}
                  priority
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="relative mx-auto mt-4 max-w-md lg:absolute lg:-bottom-8 lg:left-4 lg:mt-0 lg:max-w-sm lg:shadow-xl">
                <div className="rounded-2xl border border-border bg-card/95 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <SkilzLogo />
                    <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-primary">
                      <Sparkles className="size-3.5" /> Discovery quest
                    </span>
                  </div>
                  <div className="space-y-2 pt-3">
                    <ChatBubble side="ai">
                      🌟 After school, which activity feels most like YOU?
                    </ChatBubble>
                    <ChatBubble side="user">
                      🔍 Fixing things — like when our generator stopped!
                    </ChatBubble>
                    <ChatBubble side="ai">
                      You show strong potential in Engineering & Technology — try a challenge!
                    </ChatBubble>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why this matters */}
        <section
          id="why-it-matters"
          className="border-y border-border bg-card/60 py-16 md:py-20"
        >
          <div className="mx-auto w-full max-w-6xl px-5">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-primary">Why this matters</p>
                <h2 className="mt-2 text-balance text-3xl font-bold md:text-4xl">
                  Many students must make important educational and career decisions before they have had enough
                  chances to discover what they are actually good at.
                </h2>
                <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                  In Sierra Leone, secondary-school students often face limited exposure to different industries,
                  uneven access to career guidance, and fewer opportunities to try hands-on activities in fields
                  like technology, engineering, entrepreneurship, or media — especially in schools with fewer resources.
                </p>
              </div>
              <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
                <Image
                  src={LANDING_IMAGES.careerExploration}
                  alt="Illustration of career paths students can explore: STEM, debate, entrepreneurship, health, media, and engineering"
                  width={1200}
                  height={675}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { step: '1', label: 'Discover potential', detail: '20-question quest across interests & strengths' },
                { step: '2', label: 'Try practical activities', detail: 'Mini-challenges you can do at school or home' },
                { step: '3', label: 'Receive feedback', detail: 'AI feedback plus your own reflection' },
                { step: '4', label: 'Explore possibilities', detail: 'Career areas, clubs, starter projects' },
                { step: '5', label: 'Build a plan', detail: 'Realistic next steps — not generic courses' },
              ].map((item) => (
                <li
                  key={item.step}
                  className="rounded-2xl border border-border bg-background p-5"
                >
                  <span className="font-display text-sm font-bold text-primary">{item.step}</span>
                  <h3 className="mt-2 font-bold">{item.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Example student story */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16 md:py-20">
          <div className="grid gap-8 overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-[1fr_1.1fr]">
            <div className="relative min-h-[220px] md:min-h-full">
              <Image
                src={LANDING_IMAGES.studentJourney}
                alt="Illustration of a fictional Form 4 student thinking about career paths in technology, teaching, and problem-solving"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
            <div className="p-6 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Example student journey · fictional illustration, not research data
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                Meet Aminata — a Form 4 student who wants a successful career but does not know which field fits her.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Aminata is good at maths and enjoys helping classmates understand difficult topics, but she has
                never tried coding, robotics, or entrepreneurship. Her family suggests nursing or teaching because
                those paths are familiar — but she is not sure what she would enjoy.
              </p>
              <ol className="mt-8 space-y-3">
                {DEMO_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-sm font-medium text-muted-foreground">
                Result: Aminata does not get a label like &ldquo;You are an engineer.&rdquo; She gets: &ldquo;You show strong
                potential in analytical thinking and teaching — worth exploring further.&rdquo;
              </p>
              <StartCta className="mt-6" />
            </div>
          </div>
        </section>

        {/* Real problems */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">Real problems we address</p>
            <h2 className="mt-2 text-balance text-3xl font-bold md:text-4xl">
              Helping students move from uncertainty to exploration
            </h2>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {SL_PROBLEMS.map((item) => (
              <li
                key={item.problem}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <p className="font-display text-base font-bold">{item.problem}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.solution}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-y border-border bg-card/60 py-16 md:py-24"
        >
          <div className="mx-auto w-full max-w-6xl px-5">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-primary">How it works</p>
              <h2 className="mt-2 text-balance text-3xl font-bold md:text-4xl">
                Discover → test → understand → explore → develop
              </h2>
              <p className="mt-3 text-muted-foreground">
                The structured 20-question assessment works without continuous AI chat — AI is used where it
                adds real value: analysis, challenge feedback, recommendations, and your development plan.
              </p>
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="flex flex-col rounded-2xl border border-border bg-background p-6"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <step.icon className="size-5" />
                  </span>
                  <div className="mt-5 flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button asChild variant="outline">
                <Link href="#how-it-works">
                  See the full journey
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
          <div className="overflow-hidden rounded-3xl border border-border bg-primary text-primary-foreground">
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-[200px] md:min-h-[320px]">
                <Image
                  src={LANDING_IMAGES.hero}
                  alt=""
                  aria-hidden
                  fill
                  className="object-cover opacity-100 md:opacity-50"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-primary/70" aria-hidden />
              </div>
              <div className="flex flex-col justify-center p-6 md:p-12">
                <ShieldCheck className="size-8 opacity-90" />
                <h2 className="mt-4 text-balance text-2xl font-bold md:text-3xl">
                  We don&apos;t tell young people who they are. We give them opportunities to discover what they could become.
                </h2>
                <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-primary-foreground/80">
                  Every insight is framed as a possibility to explore — grounded in what you actually choose and do,
                  and always yours to test, challenge, and discuss with people you trust.
                </p>
                <StartCta className="mt-6 w-fit bg-primary-foreground text-primary hover:bg-primary-foreground/90" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <SkilzLogo showSubtitle />
          <p>Built by the VISSIONERS team for Sierra Leonean youth.</p>
        </div>
      </footer>

      <LandingBottomBar />
    </div>
  )
}

function ChatBubble({
  side,
  children,
}: {
  side: 'ai' | 'user'
  children: React.ReactNode
}) {
  if (side === 'ai') {
    return (
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-accent px-4 py-2.5 text-sm leading-relaxed text-accent-foreground">
        {children}
      </div>
    )
  }
  return (
    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
      {children}
    </div>
  )
}
