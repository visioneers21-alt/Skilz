/** Full skill taxonomy used to narrow discovery across ~150 skills. */

export type SkillDomainId =
  | 'communication'
  | 'leadership'
  | 'creative'
  | 'technical'
  | 'analytical'
  | 'business'
  | 'teaching'
  | 'social'
  | 'organization'
  | 'hands-on'
  | 'service'
  | 'media'

export interface CatalogSkill {
  slug: string
  name: string
  domain: SkillDomainId
  tags: string[]
}

export const SKILL_DOMAINS: Record<SkillDomainId, string> = {
  communication: 'Communication & Language',
  leadership: 'Leadership & Influence',
  creative: 'Creative & Design',
  technical: 'Technical & Digital',
  analytical: 'Analytical & Research',
  business: 'Business & Entrepreneurship',
  teaching: 'Teaching & Mentoring',
  social: 'Social & Emotional',
  organization: 'Organization & Planning',
  'hands-on': 'Hands-on & Physical',
  service: 'Service & Care',
  media: 'Media & Content',
}

function skill(
  slug: string,
  name: string,
  domain: SkillDomainId,
  tags: string[] = [],
): CatalogSkill {
  return { slug, name, domain, tags }
}

export const FULL_SKILL_CATALOG: CatalogSkill[] = [
  // Communication & Language (13)
  skill('public-speaking', 'Public Speaking', 'communication', ['speaking', 'presentation']),
  skill('active-listening', 'Active Listening', 'communication', ['listening', 'empathy']),
  skill('persuasive-writing', 'Persuasive Writing', 'communication', ['writing', 'persuasion']),
  skill('storytelling', 'Storytelling', 'communication', ['narrative', 'creative']),
  skill('negotiation', 'Negotiation', 'communication', ['conflict', 'business']),
  skill('cross-cultural-communication', 'Cross-Cultural Communication', 'communication', ['culture', 'global']),
  skill('technical-writing', 'Technical Writing', 'communication', ['writing', 'technical']),
  skill('editing', 'Editing & Proofreading', 'communication', ['writing', 'detail']),
  skill('translation', 'Translation', 'communication', ['language', 'culture']),
  skill('nonverbal-communication', 'Nonverbal Communication', 'communication', ['presence', 'social']),
  skill('conflict-mediation', 'Conflict Mediation', 'communication', ['conflict', 'social']),
  skill('presentation-design', 'Presentation Design', 'communication', ['design', 'presentation']),
  skill('interview-communication', 'Interview Communication', 'communication', ['speaking', 'professional']),

  // Leadership & Influence (13)
  skill('team-leadership', 'Team Leadership', 'leadership', ['teams', 'management']),
  skill('strategic-vision', 'Strategic Vision', 'leadership', ['strategy', 'planning']),
  skill('decision-making', 'Decision Making', 'leadership', ['judgment', 'analytical']),
  skill('delegation', 'Delegation', 'leadership', ['management', 'teams']),
  skill('mentoring-leaders', 'Leadership Mentoring', 'leadership', ['mentoring', 'coaching']),
  skill('change-management', 'Change Management', 'leadership', ['change', 'organization']),
  skill('public-influence', 'Public Influence', 'leadership', ['influence', 'speaking']),
  skill('motivation', 'Motivating Others', 'leadership', ['motivation', 'teams']),
  skill('accountability', 'Accountability', 'leadership', ['integrity', 'management']),
  skill('crisis-leadership', 'Crisis Leadership', 'leadership', ['crisis', 'decision']),
  skill('ethical-leadership', 'Ethical Leadership', 'leadership', ['ethics', 'integrity']),
  skill('volunteer-coordination', 'Volunteer Coordination', 'leadership', ['community', 'organization']),
  skill('advocacy', 'Advocacy', 'leadership', ['advocacy', 'influence']),

  // Creative & Design (13)
  skill('visual-design', 'Visual Design', 'creative', ['design', 'visual']),
  skill('graphic-design', 'Graphic Design', 'creative', ['design', 'graphics']),
  skill('ux-design', 'UX Design', 'creative', ['design', 'technology']),
  skill('ui-design', 'UI Design', 'creative', ['design', 'technology']),
  skill('illustration', 'Illustration', 'creative', ['art', 'visual']),
  skill('photography', 'Photography', 'creative', ['visual', 'media']),
  skill('creative-writing', 'Creative Writing', 'creative', ['writing', 'narrative']),
  skill('music-composition', 'Music Composition', 'creative', ['music', 'art']),
  skill('fashion-design', 'Fashion Design', 'creative', ['design', 'style']),
  skill('interior-design', 'Interior Design', 'creative', ['design', 'space']),
  skill('animation', 'Animation', 'creative', ['visual', 'media']),
  skill('brand-design', 'Brand Design', 'creative', ['design', 'marketing']),
  skill('ideation', 'Creative Ideation', 'creative', ['ideas', 'innovation']),

  // Technical & Digital (13)
  skill('software-development', 'Software Development', 'technical', ['coding', 'technology']),
  skill('web-development', 'Web Development', 'technical', ['coding', 'web']),
  skill('data-engineering', 'Data Engineering', 'technical', ['data', 'technology']),
  skill('cybersecurity', 'Cybersecurity', 'technical', ['security', 'technology']),
  skill('cloud-computing', 'Cloud Computing', 'technical', ['infrastructure', 'technology']),
  skill('mobile-development', 'Mobile Development', 'technical', ['coding', 'mobile']),
  skill('devops', 'DevOps', 'technical', ['infrastructure', 'automation']),
  skill('ai-machine-learning', 'AI & Machine Learning', 'technical', ['ai', 'data']),
  skill('database-management', 'Database Management', 'technical', ['data', 'systems']),
  skill('systems-architecture', 'Systems Architecture', 'technical', ['systems', 'design']),
  skill('qa-testing', 'QA & Testing', 'technical', ['quality', 'detail']),
  skill('it-support', 'IT Support', 'technical', ['support', 'troubleshooting']),
  skill('automation', 'Automation', 'technical', ['efficiency', 'systems']),

  // Analytical & Research (13)
  skill('data-analysis', 'Data Analysis', 'analytical', ['data', 'numbers']),
  skill('statistical-reasoning', 'Statistical Reasoning', 'analytical', ['statistics', 'data']),
  skill('research-design', 'Research Design', 'analytical', ['research', 'method']),
  skill('critical-thinking', 'Critical Thinking', 'analytical', ['logic', 'reasoning']),
  skill('logical-reasoning', 'Logical Reasoning', 'analytical', ['logic', 'problem-solving']),
  skill('scientific-method', 'Scientific Method', 'analytical', ['science', 'research']),
  skill('market-research', 'Market Research', 'analytical', ['business', 'research']),
  skill('financial-analysis', 'Financial Analysis', 'analytical', ['finance', 'numbers']),
  skill('forecasting', 'Forecasting', 'analytical', ['planning', 'data']),
  skill('problem-decomposition', 'Problem Decomposition', 'analytical', ['problem-solving', 'logic']),
  skill('root-cause-analysis', 'Root Cause Analysis', 'analytical', ['problem-solving', 'investigation']),
  skill('evidence-evaluation', 'Evidence Evaluation', 'analytical', ['research', 'judgment']),
  skill('survey-design', 'Survey Design', 'analytical', ['research', 'data']),

  // Business & Entrepreneurship (13)
  skill('entrepreneurship', 'Entrepreneurship', 'business', ['startup', 'innovation']),
  skill('sales', 'Sales', 'business', ['persuasion', 'customers']),
  skill('marketing', 'Marketing', 'business', ['promotion', 'strategy']),
  skill('business-development', 'Business Development', 'business', ['growth', 'partnerships']),
  skill('customer-discovery', 'Customer Discovery', 'business', ['research', 'customers']),
  skill('pricing-strategy', 'Pricing Strategy', 'business', ['strategy', 'finance']),
  skill('fundraising', 'Fundraising', 'business', ['finance', 'pitching']),
  skill('operations', 'Operations', 'business', ['process', 'efficiency']),
  skill('supply-chain', 'Supply Chain', 'business', ['logistics', 'planning']),
  skill('retail-management', 'Retail Management', 'business', ['management', 'customers']),
  skill('e-commerce', 'E-Commerce', 'business', ['digital', 'sales']),
  skill('product-strategy', 'Product Strategy', 'business', ['product', 'strategy']),
  skill('competitive-analysis', 'Competitive Analysis', 'business', ['strategy', 'research']),

  // Teaching & Mentoring (12)
  skill('teaching', 'Teaching', 'teaching', ['education', 'explaining']),
  skill('tutoring', 'Tutoring', 'teaching', ['education', 'support']),
  skill('curriculum-design', 'Curriculum Design', 'teaching', ['education', 'planning']),
  skill('coaching', 'Coaching', 'teaching', ['mentoring', 'growth']),
  skill('workshop-facilitation', 'Workshop Facilitation', 'teaching', ['groups', 'facilitation']),
  skill('educational-technology', 'Educational Technology', 'teaching', ['education', 'technology']),
  skill('peer-mentoring', 'Peer Mentoring', 'teaching', ['mentoring', 'social']),
  skill('training-delivery', 'Training Delivery', 'teaching', ['education', 'speaking']),
  skill('explain-complex-topics', 'Explaining Complex Topics', 'teaching', ['communication', 'education']),
  skill('learning-design', 'Learning Design', 'teaching', ['education', 'design']),
  skill('youth-mentoring', 'Youth Mentoring', 'teaching', ['mentoring', 'community']),
  skill('academic-support', 'Academic Support', 'teaching', ['education', 'support']),

  // Social & Emotional (12)
  skill('empathy', 'Empathy', 'social', ['emotional', 'support']),
  skill('emotional-intelligence', 'Emotional Intelligence', 'social', ['emotional', 'awareness']),
  skill('relationship-building', 'Relationship Building', 'social', ['networking', 'trust']),
  skill('networking', 'Networking', 'social', ['connections', 'professional']),
  skill('teamwork', 'Teamwork', 'social', ['collaboration', 'groups']),
  skill('collaboration', 'Collaboration', 'social', ['teams', 'cooperation']),
  skill('active-support', 'Active Support', 'social', ['helping', 'care']),
  skill('cultural-sensitivity', 'Cultural Sensitivity', 'social', ['culture', 'inclusion']),
  skill('community-building', 'Community Building', 'social', ['community', 'leadership']),
  skill('customer-empathy', 'Customer Empathy', 'social', ['customers', 'understanding']),
  skill('peer-support', 'Peer Support', 'social', ['helping', 'listening']),
  skill('social-perception', 'Social Perception', 'social', ['awareness', 'reading-people']),

  // Organization & Planning (12)
  skill('project-management', 'Project Management', 'organization', ['planning', 'teams']),
  skill('time-management', 'Time Management', 'organization', ['planning', 'productivity']),
  skill('event-planning', 'Event Planning', 'organization', ['planning', 'coordination']),
  skill('process-improvement', 'Process Improvement', 'organization', ['efficiency', 'systems']),
  skill('goal-setting', 'Goal Setting', 'organization', ['planning', 'motivation']),
  skill('prioritization', 'Prioritization', 'organization', ['planning', 'decision']),
  skill('documentation', 'Documentation', 'organization', ['writing', 'systems']),
  skill('meeting-facilitation', 'Meeting Facilitation', 'organization', ['groups', 'communication']),
  skill('resource-planning', 'Resource Planning', 'organization', ['planning', 'management']),
  skill('workflow-design', 'Workflow Design', 'organization', ['systems', 'efficiency']),
  skill('risk-management', 'Risk Management', 'organization', ['planning', 'analysis']),
  skill('quality-assurance', 'Quality Assurance', 'organization', ['quality', 'detail']),

  // Hands-on & Physical (12)
  skill('manual-dexterity', 'Manual Dexterity', 'hands-on', ['physical', 'craft']),
  skill('craftsmanship', 'Craftsmanship', 'hands-on', ['craft', 'quality']),
  skill('carpentry', 'Carpentry', 'hands-on', ['building', 'craft']),
  skill('cooking', 'Cooking', 'hands-on', ['food', 'creativity']),
  skill('gardening', 'Gardening', 'hands-on', ['nature', 'patience']),
  skill('athletic-coordination', 'Athletic Coordination', 'hands-on', ['sports', 'physical']),
  skill('repair-maintenance', 'Repair & Maintenance', 'hands-on', ['fixing', 'practical']),
  skill('laboratory-techniques', 'Laboratory Techniques', 'hands-on', ['science', 'precision']),
  skill('fine-motor-skills', 'Fine Motor Skills', 'hands-on', ['precision', 'physical']),
  skill('spatial-reasoning', 'Spatial Reasoning', 'hands-on', ['visual', 'engineering']),
  skill('equipment-operation', 'Equipment Operation', 'hands-on', ['technical', 'physical']),
  skill('safety-awareness', 'Safety Awareness', 'hands-on', ['careful', 'responsible']),

  // Service & Care (12)
  skill('customer-service', 'Customer Service', 'service', ['customers', 'helping']),
  skill('healthcare-support', 'Healthcare Support', 'service', ['care', 'health']),
  skill('caregiving', 'Caregiving', 'service', ['care', 'empathy']),
  skill('hospitality', 'Hospitality', 'service', ['service', 'welcoming']),
  skill('counseling-support', 'Counseling Support', 'service', ['support', 'listening']),
  skill('social-work-orientation', 'Social Work Orientation', 'service', ['community', 'advocacy']),
  skill('patient-advocacy', 'Patient Advocacy', 'service', ['advocacy', 'care']),
  skill('active-assistance', 'Active Assistance', 'service', ['helping', 'practical']),
  skill('community-service', 'Community Service', 'service', ['community', 'volunteering']),
  skill('client-relations', 'Client Relations', 'service', ['relationships', 'professional']),
  skill('wellness-coaching', 'Wellness Coaching', 'service', ['health', 'coaching']),
  skill('emergency-response', 'Emergency Response', 'service', ['crisis', 'calm']),

  // Media & Content (12)
  skill('content-creation', 'Content Creation', 'media', ['creative', 'digital']),
  skill('video-production', 'Video Production', 'media', ['video', 'creative']),
  skill('podcasting', 'Podcasting', 'media', ['audio', 'speaking']),
  skill('social-media', 'Social Media', 'media', ['digital', 'marketing']),
  skill('journalism', 'Journalism', 'media', ['writing', 'research']),
  skill('copywriting', 'Copywriting', 'media', ['writing', 'marketing']),
  skill('seo-content', 'SEO Content', 'media', ['writing', 'digital']),
  skill('live-streaming', 'Live Streaming', 'media', ['video', 'speaking']),
  skill('audio-editing', 'Audio Editing', 'media', ['audio', 'technical']),
  skill('scriptwriting', 'Scriptwriting', 'media', ['writing', 'narrative']),
  skill('digital-storytelling', 'Digital Storytelling', 'media', ['narrative', 'creative']),
  skill('community-management', 'Community Management', 'media', ['social', 'digital']),
]

export const SKILL_COUNT = FULL_SKILL_CATALOG.length

export const SKILLS_BY_SLUG = Object.fromEntries(
  FULL_SKILL_CATALOG.map((s) => [s.slug, s]),
) as Record<string, CatalogSkill>

export const SKILLS_BY_DOMAIN = FULL_SKILL_CATALOG.reduce(
  (acc, s) => {
    if (!acc[s.domain]) acc[s.domain] = []
    acc[s.domain].push(s)
    return acc
  },
  {} as Record<SkillDomainId, CatalogSkill[]>,
)

/** Profile interest → domain affinity for the opening bias. */
export const INTEREST_DOMAIN_BOOSTS: Record<string, SkillDomainId[]> = {
  Technology: ['technical', 'analytical'],
  Design: ['creative', 'media'],
  Writing: ['communication', 'media'],
  Business: ['business', 'organization'],
  Science: ['analytical', 'hands-on'],
  Teaching: ['teaching', 'communication'],
  'Art & Music': ['creative', 'media'],
  Sports: ['hands-on', 'leadership'],
  Health: ['service', 'social'],
  Gaming: ['technical', 'media'],
  Community: ['social', 'service'],
  Travel: ['social', 'communication'],
}
