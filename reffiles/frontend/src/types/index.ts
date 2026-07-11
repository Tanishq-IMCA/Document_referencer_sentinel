export type ExperienceLevel = 'student' | 'junior' | 'professional' | 'senior' | 'freelancer';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface User {
  id: string;
  name: string;
  email: string;
  occupation: ExperienceLevel;
  techStack: string[];
  githubUsername?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CodeSmell {
  id: string;
  type: string;
  file: string;
  count: number;
  severity?: SeverityLevel;
  description?: string;
  recommendation?: string;
  codeSnippet?: string;
}

export interface SkillAssessmentItem {
  name: string;
  claimed: number;
  actual: number;
  trend: number;
  verdict: 'overestimated' | 'underestimated' | 'accurate';
  evidence: string;
}

export interface LastScan {
  overallScore: number;
  scanDate: string;
  securityScore?: number;
  codeQualityScore?: number;
  architectureScore?: number;
  skillScore?: number;
  metrics?: {
    totalFiles: number;
    linesOfCode: number;
    testCoverage: number;
    avgComplexity: number;
    duplication: number;
  };
  findings?: Array<{
    id: string;
    severity: SeverityLevel;
    title: string;
    description: string;
    file: string;
    line: number;
    tool: string;
    recommendation: string;
  }>;
  codeSmells?: CodeSmell[];
  dependencies?: {
    upToDate: number;
    outdated: number;
    vulnerable: number;
  };
  skillAssessment?: SkillAssessmentItem[];
  /* —— Architecture —— */
  architectureDetails?: {
    couplingScore: number;
    cohesionScore: number;
    layerSeparation: number;
    modularityScore: number;
    detectedPatterns: string[];
    antiPatterns: string[];
    layerBreakdown: Array<{ layer: string; files: number; score: number }>;
    couplingGraph: Array<{ from: string; to: string; strength: number }>;
  };
  /* —— Code Quality —— */
  codeQualityDetails?: {
    lintScore: number;
    docCoverage: number;
    testQuality: number;
    consistencyScore: number;
    reviewScore: number;
    complexityDist: Array<{ range: string; count: number }>;
    testMetrics: {
      totalTests: number;
      passing: number;
      failing: number;
      flaky: number;
      avgDuration: number;
    };
  };
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  language: string;
  stars: number;
  forks: number;
  private?: boolean;
  lastScanned?: string;
  scanStatus?: ScanStatus;
  description?: string;
  lastScan?: LastScan;
}

export type ScanStatus = 'idle' | 'queued' | 'scanning' | 'completed' | 'failed';

export interface ScanProgress {
  repoId: string;
  stage: string;
  progress: number;
  message: string;
  completedRepos: string[];
}

export interface SecurityFinding {
  id: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  file: string;
  line: number;
  code?: string;
  tool: string;
}

export interface CodeQualityIssue {
  id: string;
  type: 'bug' | 'smell' | 'complexity' | 'maintainability';
  severity: SeverityLevel;
  title: string;
  description: string;
  file: string;
  line?: number;
  suggestion?: string;
}

export interface SkillAssessment {
  skill: string;
  claimed: number;
  actual: number;
  verdict: 'overestimated' | 'accurate' | 'underestimated';
  evidence: string;
}

export interface ScanResult {
  repoId: string;
  repoName: string;
  completedAt: string;
  overallScore: number;
  complexityScore: number;
  securityScore: number;
  maintainabilityScore: number;
  linesOfCode: number;
  languages: Record<string, number>;
  securityFindings: SecurityFinding[];
  codeQualityIssues: CodeQualityIssue[];
  skillAssessments: SkillAssessment[];
  architectureSummary: string;
  aiInsights?: string;
}

export interface OnboardingData {
  name: string;
  age?: number;
  occupation: ExperienceLevel;
  techStack: string[];
  resumeText?: string;
  linkedinUrl?: string;
  githubUsername: string;
  githubPat?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
