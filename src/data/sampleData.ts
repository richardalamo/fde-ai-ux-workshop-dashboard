import { DerivedTask, Owner, Project, Task, TaskManualState, TaskStatus } from '../types/dashboard';
import { addDays, getDiffDays, getTodayString } from '../utils/dates';

export const OWNERS: Owner[] = [
  { id: 'own-1', name: 'Maya Chen', initials: 'MC', role: 'Senior delivery manager' },
  { id: 'own-2', name: 'David Okafor', initials: 'DO', role: 'Technical project lead' },
  { id: 'own-3', name: 'Rachel Lindqvist', initials: 'RL', role: 'Implementation manager' },
  { id: 'own-4', name: 'Tomas Herrera', initials: 'TH', role: 'Solutions lead' },
  { id: 'own-5', name: 'Priya Patel', initials: 'PP', role: 'Client delivery lead' },
  { id: 'own-6', name: 'Samira Al-Mansoor', initials: 'SA', role: 'Program manager' },
  { id: 'own-7', name: 'Liam Brooks', initials: 'LB', role: 'Integration specialist' },
  { id: 'own-8', name: 'Hannah Kowalski', initials: 'HK', role: 'Operations manager' },
];

export const PROJECTS: Project[] = [
  { id: 'prj-01', name: 'Northstar ERP migration', client: 'Northstar Logistics', leadId: 'own-1' },
  { id: 'prj-02', name: 'Meridian portal redesign', client: 'Meridian Health', leadId: 'own-2' },
  { id: 'prj-03', name: 'Alder compliance audit', client: 'Alder Financial', leadId: 'own-3' },
  { id: 'prj-04', name: 'Beacon POS rollout', client: 'Beacon Retail Group', leadId: 'own-4' },
  { id: 'prj-05', name: 'Cinder API integration', client: 'Cinder Freight', leadId: 'own-5' },
  { id: 'prj-06', name: 'Crestview billing automation', client: 'Crestview Utilities', leadId: 'own-6' },
  { id: 'prj-07', name: 'Delta fleet tracker', client: 'Delta Transport', leadId: 'own-7' },
  { id: 'prj-08', name: 'Elmwood claims workflow', client: 'Elmwood Insurance', leadId: 'own-8' },
  { id: 'prj-09', name: 'Fairview onboarding flow', client: 'Fairview Bank', leadId: 'own-1' },
  { id: 'prj-10', name: 'Granite IoT sync', client: 'Granite Manufacturing', leadId: 'own-2' },
  { id: 'prj-11', name: 'Harborview telemetry dashboard', client: 'Harborview Marine', leadId: 'own-3' },
  { id: 'prj-12', name: 'Ironwood supply portal', client: 'Ironwood Timber', leadId: 'own-4' },
  { id: 'prj-13', name: 'Juniper CRM upgrade', client: 'Juniper Telecom', leadId: 'own-5' },
  { id: 'prj-14', name: 'Kestrel grid reporting', client: 'Kestrel Energy', leadId: 'own-6' },
  { id: 'prj-15', name: 'Larkspur HRIS sync', client: 'Larkspur Media', leadId: 'own-7' },
  { id: 'prj-16', name: 'Maple Leaf payroll cutover', client: 'Maple Leaf Foods', leadId: 'own-8' },
  { id: 'prj-17', name: 'Nautilus customs EDI', client: 'Nautilus Shipping', leadId: 'own-1' },
  { id: 'prj-18', name: 'Oakridge patient intake', client: 'Oakridge Clinic', leadId: 'own-2' },
  { id: 'prj-19', name: 'Pinnacle ad analytics', client: 'Pinnacle Partners', leadId: 'own-3' },
  { id: 'prj-20', name: 'Quarry inventory app', client: 'Quarry Materials', leadId: 'own-4' },
  { id: 'prj-21', name: 'Redwood trial tracker', client: 'Redwood Bio', leadId: 'own-5' },
  { id: 'prj-22', name: 'Silverline transit ticketing', client: 'Silverline Metro', leadId: 'own-6' },
  { id: 'prj-23', name: 'Summit security hardening', client: 'Summit Cloud', leadId: 'own-7' },
  { id: 'prj-24', name: 'Timberline GIS mapping', client: 'Timberline Forestry', leadId: 'own-8' },
  { id: 'prj-25', name: 'Vanguard document vault', client: 'Vanguard Legal', leadId: 'own-1' },
  { id: 'prj-26', name: 'Westfield loyalty launch', client: 'Westfield Stores', leadId: 'own-2' },
  { id: 'prj-27', name: 'Willow Creek water billing', client: 'Willow Creek Municipal', leadId: 'own-3' },
  { id: 'prj-28', name: 'Zephyr cargo manifest', client: 'Zephyr Aviation', leadId: 'own-4' },
  { id: 'prj-29', name: 'Horizon lab LIMS sync', client: 'Horizon Diagnostics', leadId: 'own-5' },
  { id: 'prj-30', name: 'Cobalt ledger reconciliation', client: 'Cobalt FinTech', leadId: 'own-6' },
];

const TASK_TEMPLATES = [
  'Sign off UAT test plan with client',
  'Complete staging data migration dry run',
  'Finalize SSO SAML metadata exchange',
  'Deliver security questionnaire responses',
  'Validate webhook retry handling in sandbox',
  'Review invoice export CSV mapping',
  'Confirm production cutover window',
  'Publish API rate limit documentation',
  'Resolve role permissions discrepancy',
  'Complete accessibility audit fixes',
  'Verify multi-currency rounding rules',
  'Migrate historical customer records',
  'Configure automated daily backup alerts',
  'Obtain legal review on DPA addendum',
  'Run load test for peak traffic scenario',
  'Finalize training deck for regional managers',
  'Audit third-party connector credentials',
  'Deliver executive status summary',
  'Reconcile opening ledger balances',
  'Set up custom domain TLS certificates',
  'Test failover recovery procedure',
  'Review mobile viewport layout QA',
  'Approve final field mapping specification',
  'Configure single-tenant database backups',
  'Complete pen-test remediation checklist',
];

const BLOCKER_REASONS = [
  'Waiting on client IT team to share production SAML certificate.',
  'Pending legal sign-off on data processing addendum.',
  'Blocked by vendor sandbox maintenance until next Tuesday.',
  'Awaiting final CSV schema approval from client finance lead.',
  'Client firewall rule change request is still in security review.',
  'Waiting on third-party API credentials from partner engineering.',
  'Dependent on upstream billing table migration sign-off.',
  'Client stakeholder out of office until Monday for final UAT review.',
];

const TASK_NOTES = [
  'Reviewed in Tuesday check-in; next follow-up scheduled with client operations lead.',
  'Initial pass completed in staging; waiting on edge-case verification before production push.',
  'Checklist shared in project channel. Needs one final pass against client requirements.',
  'Client requested minor adjustments to export column order prior to release.',
  'Automated test suite passes; manual verification required for legacy records.',
  'Escalated during internal standup so dependencies stay visible ahead of Friday review.',
];

interface ScheduleSpec {
  offsetDays: number;
  manualState: TaskManualState;
}

function buildScheduleDistribution(): ScheduleSpec[] {
  const specs: ScheduleSpec[] = [];

  // 20 overdue tasks (1 to 16 days overdue)
  const overdueOffsets = [
    -16, -14, -12, -11, -10, -9, -8, -7, -6, -6,
    -5, -5, -4, -4, -3, -3, -2, -2, -1, -1,
  ];
  for (const offset of overdueOffsets) {
    specs.push({ offsetDays: offset, manualState: 'active' });
  }

  // 16 due soon tasks (0 to 3 days from today)
  const dueSoonOffsets = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3];
  for (const offset of dueSoonOffsets) {
    specs.push({ offsetDays: offset, manualState: 'active' });
  }

  // 18 due later this week (4 to 7 days from today)
  const thisWeekOffsets = [4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7];
  for (const offset of thisWeekOffsets) {
    specs.push({ offsetDays: offset, manualState: 'active' });
  }

  // 11 blocked tasks (some past due, some this week, some later)
  const blockedOffsets = [-7, -4, -2, 0, 1, 3, 5, 8, 10, 14, 18];
  for (const offset of blockedOffsets) {
    specs.push({ offsetDays: offset, manualState: 'blocked' });
  }

  // 38 on track tasks (8 to 34 days from today)
  for (let i = 0; i < 38; i++) {
    const offset = 8 + ((i * 7) % 27);
    specs.push({ offsetDays: offset, manualState: 'active' });
  }

  // 47 done tasks (completed across -25 to +5 days)
  for (let i = 0; i < 47; i++) {
    const offset = -24 + ((i * 3) % 29);
    specs.push({ offsetDays: offset, manualState: 'done' });
  }

  return specs; // Total: 20 + 16 + 18 + 11 + 38 + 47 = 150 tasks
}

export function generateInitialTasks(todayStr = getTodayString()): Task[] {
  const specs = buildScheduleDistribution();
  const tasks: Task[] = [];

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    // Spread across all 30 projects (5 tasks per project) using prime stride so statuses mix across projects
    const projectIndex = (i * 7) % PROJECTS.length;
    const project = PROJECTS[projectIndex];

    // Spread across all 8 owners evenly
    const ownerIndex = (i * 3 + Math.floor(i / 8)) % OWNERS.length;
    const owner = OWNERS[ownerIndex];

    const template = TASK_TEMPLATES[(i * 5 + projectIndex) % TASK_TEMPLATES.length];
    const dueDate = addDays(todayStr, spec.offsetDays);
    const updatedOffset = Math.min(spec.offsetDays - 2, -1);
    const updatedAt = addDays(todayStr, updatedOffset < -30 ? -30 : updatedOffset);

    const task: Task = {
      id: `tsk-${String(i + 1).padStart(3, '0')}`,
      title: template,
      projectId: project.id,
      ownerId: owner.id,
      dueDate,
      manualState: spec.manualState,
      blockerReason:
        spec.manualState === 'blocked'
          ? BLOCKER_REASONS[i % BLOCKER_REASONS.length]
          : undefined,
      notes: TASK_NOTES[i % TASK_NOTES.length],
      updatedAt,
    };

    tasks.push(task);
  }

  return tasks;
}

export function computeTaskStatus(
  manualState: TaskManualState,
  diffDays: number
): TaskStatus {
  if (manualState === 'done') return 'Done';
  if (manualState === 'blocked') return 'Blocked';
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 3) return 'Due soon';
  return 'On track';
}

export function deriveTasks(
  tasks: Task[],
  projects: Project[],
  owners: Owner[],
  todayStr = getTodayString()
): DerivedTask[] {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const ownerMap = new Map(owners.map((o) => [o.id, o]));

  return tasks.map((task) => {
    const diffDays = getDiffDays(task.dueDate, todayStr);
    const status = computeTaskStatus(task.manualState, diffDays);
    const daysOverdue = status === 'Overdue' ? Math.abs(diffDays) : 0;

    return {
      ...task,
      status,
      diffDays,
      daysOverdue,
      project: projectMap.get(task.projectId) ?? projects[0],
      owner: ownerMap.get(task.ownerId) ?? owners[0],
    };
  });
}
