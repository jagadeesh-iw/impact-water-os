'use client';

import { useEffect, useState } from 'react';
import type {
  ComponentType,
  Dispatch,
  ReactNode,
  SetStateAction,
} from 'react';

import {
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardList,
  Clock3,
  FileText,
  FolderKanban,
  Gauge,
  Globe2,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Tag,
  Truck,
  Users,
  X,
  Zap,
} from 'lucide-react';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

/* =========================================================
   TYPES
========================================================= */

type Status =
  | 'To Do'
  | 'In Progress'
  | 'Waiting'
  | 'Blocked'
  | 'Done'
  | 'Cancelled';

type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

type ProjectStatus =
  | 'Planning'
  | 'Active'
  | 'On Hold'
  | 'Completed'
  | 'Cancelled';

type Task = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: Status;
  priority: Priority;
  due: string;
  tags: string[];
  subtasks: {
    id: string;
    title: string;
    done: boolean;
  }[];
  created: string;
  updated: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  category: string;
  due: string;
  goals: string;
};

type Note = {
  id: string;
  title: string;
  body: string;
  tag: string;
  pinned: boolean;
  updated: string;
};

type Order = {
  id: string;
  marketplace: string;
  date: string;
  product: string;
  qty: number;
  amount: number;
  invoice: string;
  shipment: string;
  overall: string;
  priority: Priority;
  owner: string;
  notes: string;
};

type Issue = {
  id: string;
  title: string;
  order: string;
  category: string;
  owner: string;
  priority: Priority;
  status: string;
  due: string;
  resolution: string;
  notes: string;
};

type Campaign = {
  id: string;
  name: string;
  type: string;
  audience: string;
  start: string;
  end: string;
  status: string;
  targeted: number;
  sent: number;
  delivered: number;
  clicks: number;
  orders: number;
  revenue: number;
  notes: string;
  results: string;
  learnings: string;
};

type Experiment = {
  id: string;
  name: string;
  hypothesis: string;
  problem: string;
  action: string;
  channel: string;
  start: string;
  end: string;
  metric: string;
  baseline: string;
  target: string;
  result: string;
  learning: string;
  decision: string;
};

type Ecommerce = {
  id: string;
  marketplace: string;
  date: string;
  orders: number;
  revenue: number;
  units: number;
  cancellations: number;
  returns: number;
  stockouts: number;
  notes: string;
};

/* =========================================================
   HELPERS
========================================================= */

const uid = () => Math.random().toString(36).slice(2, 10);

const today = () => new Date().toISOString().slice(0, 10);

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = localStorage.getItem(`impact:${key}`);

    if (!stored) {
      return fallback;
    }

    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      `impact:${key}`,
      JSON.stringify(value),
    );
  } catch {
    // Ignore localStorage failures.
  }
}

/* =========================================================
   SEED DATA
========================================================= */

const seed = {
  projects: [
    {
      id: 'p1',
      name: 'Blinkit Growth',
      description:
        'Improve marketplace sales, availability and execution.',
      status: 'Active',
      priority: 'High',
      category: 'E-Commerce',
      due: '2026-10-05',
      goals:
        'Increase orders and reduce operational friction.',
    },
    {
      id: 'p2',
      name: 'Website Conversion Improvement',
      description:
        'Conversion, content and product-page improvements.',
      status: 'Active',
      priority: 'Medium',
      category: 'Growth',
      due: '2026-10-15',
      goals:
        'Improve website conversion and AOV.',
    },
    {
      id: 'p3',
      name: 'WhatsApp CRM',
      description:
        'Retention and reorder campaign planning.',
      status: 'Planning',
      priority: 'Medium',
      category: 'CRM',
      due: '2026-10-20',
      goals:
        'Build repeat purchase workflows.',
    },
    {
      id: 'p4',
      name: 'Operations Cleanup',
      description:
        'Resolve open fulfillment and invoice issues.',
      status: 'Active',
      priority: 'Urgent',
      category: 'Operations',
      due: '2026-09-28',
      goals:
        'Reduce waiting orders and close shipment issues.',
    },
  ] as Project[],

  tasks: [
    {
      id: 't1',
      title: 'Check Blinkit RO #1023',
      description:
        'Verify inventory, invoice and shipment status.',
      projectId: 'p1',
      status: 'Waiting',
      priority: 'Urgent',
      due: '2026-09-20',
      tags: ['Blinkit', 'RO'],
      subtasks: [
        {
          id: 's1',
          title: 'Verify RO',
          done: true,
        },
        {
          id: 's2',
          title: 'Check inventory',
          done: true,
        },
        {
          id: 's3',
          title: 'Create invoice',
          done: false,
        },
        {
          id: 's4',
          title: 'Confirm shipment',
          done: false,
        },
      ],
      created: '2026-09-19',
      updated: '2026-09-20',
    },
    {
      id: 't2',
      title:
        'Follow up with Operations regarding dispatch',
      description:
        'Confirm dispatch timing and owner.',
      projectId: 'p4',
      status: 'In Progress',
      priority: 'High',
      due: '2026-09-20',
      tags: ['Operations'],
      subtasks: [],
      created: '2026-09-19',
      updated: '2026-09-20',
    },
    {
      id: 't3',
      title: 'Create WhatsApp reorder campaign',
      description:
        'Draft audience, message and measurement plan.',
      projectId: 'p3',
      status: 'To Do',
      priority: 'Medium',
      due: '2026-09-22',
      tags: ['CRM', 'WhatsApp'],
      subtasks: [],
      created: '2026-09-18',
      updated: '2026-09-19',
    },
    {
      id: 't4',
      title: 'Review cancellation rate',
      description:
        'Review last 7 days marketplace cancellation patterns.',
      projectId: 'p1',
      status: 'Done',
      priority: 'Medium',
      due: '2026-09-19',
      tags: ['Analytics'],
      subtasks: [],
      created: '2026-09-17',
      updated: '2026-09-19',
    },
    {
      id: 't5',
      title: 'Update website product',
      description:
        'Refresh product details and promotional copy.',
      projectId: 'p2',
      status: 'To Do',
      priority: 'Low',
      due: '2026-09-23',
      tags: ['Website'],
      subtasks: [],
      created: '2026-09-18',
      updated: '2026-09-18',
    },
  ] as Task[],

  notes: [
    {
      id: 'n1',
      title: 'Founder instructions',
      body:
        'Capture weekly priorities and important follow-ups here.',
      tag: 'Founder',
      pinned: true,
      updated: '2026-09-20',
    },
  ] as Note[],

  orders: [
    {
      id: 'RO-1023',
      marketplace: 'Blinkit',
      date: '2026-09-20',
      product: 'Impact Water 1L',
      qty: 48,
      amount: 5760,
      invoice: 'Pending',
      shipment: 'Waiting',
      overall: 'Waiting',
      priority: 'Urgent',
      owner: 'Operations',
      notes: 'Awaiting dispatch confirmation.',
    },
    {
      id: 'RO-1019',
      marketplace: 'Zepto',
      date: '2026-09-19',
      product: 'Impact Water 500ml',
      qty: 96,
      amount: 7680,
      invoice: 'Sent',
      shipment: 'Dispatched',
      overall: 'Dispatched',
      priority: 'High',
      owner: 'Delivery Team',
      notes: '',
    },
  ] as Order[],

  issues: [
    {
      id: 'i1',
      title: 'RO-1023 dispatch pending',
      order: 'RO-1023',
      category: 'Shipment',
      owner: 'Operations',
      priority: 'Urgent',
      status: 'Open',
      due: '2026-09-20',
      resolution: '',
      notes: 'Follow up before EOD.',
    },
  ] as Issue[],

  campaigns: [
    {
      id: 'c1',
      name: 'September Reorder Push',
      type: 'Reorder',
      audience: 'Recent customers',
      start: '2026-09-22',
      end: '2026-09-28',
      status: 'Planned',
      targeted: 1200,
      sent: 0,
      delivered: 0,
      clicks: 0,
      orders: 0,
      revenue: 0,
      notes: '',
      results: '',
      learnings: '',
    },
  ] as Campaign[],

  experiments: [
    {
      id: 'e1',
      name: '2-pack bundle test',
      hypothesis:
        'Customers may buy more if offered a 2-pack bundle.',
      problem: 'Increase AOV.',
      action:
        'Test 2-pack bundle on website.',
      channel: 'Website',
      start: '2026-09-23',
      end: '2026-10-07',
      metric: 'AOV',
      baseline: '',
      target: '',
      result: '',
      learning: '',
      decision: 'Continue',
    },
  ] as Experiment[],

  ecommerce: [
    {
      id: 'ec1',
      marketplace: 'Blinkit',
      date: '2026-09-19',
      orders: 84,
      revenue: 98200,
      units: 120,
      cancellations: 4,
      returns: 2,
      stockouts: 1,
      notes: '',
    },
    {
      id: 'ec2',
      marketplace: 'Zepto',
      date: '2026-09-19',
      orders: 61,
      revenue: 72100,
      units: 88,
      cancellations: 3,
      returns: 1,
      stockouts: 2,
      notes: '',
    },
    {
      id: 'ec3',
      marketplace: 'Website',
      date: '2026-09-19',
      orders: 32,
      revenue: 45600,
      units: 52,
      cancellations: 1,
      returns: 0,
      stockouts: 0,
      notes: '',
    },
  ] as Ecommerce[],
};

/* =========================================================
   NAVIGATION
========================================================= */

const nav = [
  ['Dashboard', LayoutDashboard],
  ['Tasks', ClipboardList],
  ['Projects', FolderKanban],
  ['E-Commerce', ShoppingCart],
  ['Operations', Truck],
  ['CRM', Users],
  ['Growth', Sparkles],
  ['Website', Globe2],
  ['Reports', BarChart3],
  ['Notes', BookOpen],
  ['Settings', Settings],
] as const;

const statuses: Status[] = [
  'To Do',
  'In Progress',
  'Waiting',
  'Blocked',
  'Done',
  'Cancelled',
];

const priorities: Priority[] = [
  'Urgent',
  'High',
  'Medium',
  'Low',
];

const projectStatuses: ProjectStatus[] = [
  'Planning',
  'Active',
  'On Hold',
  'Completed',
  'Cancelled',
];

/* =========================================================
   COMMON UI
========================================================= */

function Badge({
  children,
  tone = 'gray',
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {children}
    </span>
  );
}

function priorityTone(priority: Priority) {
  if (priority === 'Urgent') return 'red';
  if (priority === 'High') return 'orange';
  if (priority === 'Medium') return 'yellow';

  return 'gray';
}

function statusTone(status: string) {
  if (
    status === 'Done' ||
    status === 'Completed' ||
    status === 'Dispatched' ||
    status === 'Resolved'
  ) {
    return 'green';
  }

  if (
    status === 'Waiting' ||
    status === 'On Hold' ||
    status === 'Planned'
  ) {
    return 'yellow';
  }

  if (
    status === 'Blocked' ||
    status === 'Failed' ||
    status === 'Open'
  ) {
    return 'red';
  }

  return 'blue';
}

function PageTitle({
  eyebrow,
  title,
  desc,
  action,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>

        <h1>{title}</h1>

        {desc && <p>{desc}</p>}
      </div>

      {action}
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone = 'blue',
  sub,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ size?: number }>;
  tone?: string;
  sub?: string;
}) {
  return (
    <div className="stat card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={18} />
      </div>

      <div>
        <div className="stat-value">
          {value}
        </div>

        <div className="stat-label">
          {label}
        </div>

        {sub && (
          <div className="stat-sub">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHead({
  title,
  icon: Icon,
  action,
}: {
  title: string;
  icon: ComponentType<{ size?: number }>;
  action?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div className="section-title">
        <Icon size={17} />
        <b>{title}</b>
      </div>

      {action}
    </div>
  );
}

function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="empty">
      {text}
    </div>
  );
}

function TaskRow({
  task,
  onDone,
}: {
  task: Task;
  onDone: () => void;
}) {
  return (
    <div className="task-row">
      <button
        className="check"
        onClick={onDone}
        aria-label="Complete task"
      >
        {task.status === 'Done' ? (
          <CheckCircle2 size={20} />
        ) : (
          <CircleDot size={20} />
        )}
      </button>

      <div className="task-copy">
        <b>{task.title}</b>

        <div>
          <Badge
            tone={priorityTone(
              task.priority,
            )}
          >
            {task.priority}
          </Badge>{' '}

          <Badge
            tone={statusTone(
              task.status,
            )}
          >
            {task.status}
          </Badge>

          {task.tags
            .slice(0, 2)
            .map((tag) => (
              <span
                className="tag"
                key={tag}
              >
                {tag}
              </span>
            ))}
        </div>
      </div>

      <div className="task-date">
        {task.due}
      </div>
    </div>
  );
}

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const [authed, setAuthed] =
    useState(false);

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [authLoading, setAuthLoading] =
    useState(true);

  const [authError, setAuthError] =
    useState('');

  const [page, setPage] =
    useState('Dashboard');

  const [query, setQuery] =
    useState('');

  const [showAdd, setShowAdd] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [dataReady, setDataReady] =
    useState(false);

  const [projects, setProjects] =
    useState<Project[]>(seed.projects);

  const [tasks, setTasks] =
    useState<Task[]>(seed.tasks);

  const [notes, setNotes] =
    useState<Note[]>(seed.notes);

  const [orders, setOrders] =
    useState<Order[]>(seed.orders);

  const [issues, setIssues] =
    useState<Issue[]>(seed.issues);

  const [campaigns, setCampaigns] =
    useState<Campaign[]>(seed.campaigns);

  const [experiments, setExperiments] =
    useState<Experiment[]>(
      seed.experiments,
    );

  const [ecommerce, setEcommerce] =
    useState<Ecommerce[]>(
      seed.ecommerce,
    );

  /* Firebase auth listener */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setAuthed(Boolean(user));
          setAuthLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  /* Load local workspace data */

  useEffect(() => {
    setProjects(
      load(
        'projects',
        seed.projects,
      ),
    );

    setTasks(
      load(
        'tasks',
        seed.tasks,
      ),
    );

    setNotes(
      load(
        'notes',
        seed.notes,
      ),
    );

    setOrders(
      load(
        'orders',
        seed.orders,
      ),
    );

    setIssues(
      load(
        'issues',
        seed.issues,
      ),
    );

    setCampaigns(
      load(
        'campaigns',
        seed.campaigns,
      ),
    );

    setExperiments(
      load(
        'experiments',
        seed.experiments,
      ),
    );

    setEcommerce(
      load(
        'ecommerce',
        seed.ecommerce,
      ),
    );

    setDataReady(true);
  }, []);

  /* Local persistence */

  useEffect(() => {
    if (dataReady) {
      save('projects', projects);
    }
  }, [projects, dataReady]);

  useEffect(() => {
    if (dataReady) {
      save('tasks', tasks);
    }
  }, [tasks, dataReady]);

  useEffect(() => {
    if (dataReady) {
      save('notes', notes);
    }
  }, [notes, dataReady]);

  useEffect(() => {
    if (dataReady) {
      save('orders', orders);
    }
  }, [orders, dataReady]);

  useEffect(() => {
    if (dataReady) {
      save('issues', issues);
    }
  }, [issues, dataReady]);

  useEffect(() => {
    if (dataReady) {
      save('campaigns', campaigns);
    }
  }, [campaigns, dataReady]);

  useEffect(() => {
    if (dataReady) {
      save(
        'experiments',
        experiments,
      );
    }
  }, [experiments, dataReady]);

  useEffect(() => {
    if (dataReady) {
      save(
        'ecommerce',
        ecommerce,
      );
    }
  }, [ecommerce, dataReady]);

  /* Keyboard shortcuts */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        (event.metaKey ||
          event.ctrlKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();

        document
          .getElementById(
            'global-search',
          )
          ?.focus();
      }

      if (event.key === 'Escape') {
        setShowAdd(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
  }, []);

  /* Firebase login */

  const handleLogin = async () => {
    const cleanEmail =
      email.trim();

    if (
      !cleanEmail ||
      !password
    ) {
      setAuthError(
        'Please enter your email and password.',
      );

      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password,
      );

      setPassword('');
    } catch (error: unknown) {
      console.error(
        'Firebase login error:',
        error,
      );

      const code =
        typeof error ===
          'object' &&
        error !== null &&
        'code' in error
          ? String(
              (
                error as {
                  code?: unknown;
                }
              ).code,
            )
          : '';

      if (
        code ===
          'auth/invalid-credential' ||
        code ===
          'auth/wrong-password' ||
        code ===
          'auth/user-not-found'
      ) {
        setAuthError(
          'Incorrect email or password.',
        );
      } else if (
        code ===
        'auth/too-many-requests'
      ) {
        setAuthError(
          'Too many login attempts. Please wait a few minutes and try again.',
        );
      } else if (
        code ===
        'auth/invalid-email'
      ) {
        setAuthError(
          'Please enter a valid email address.',
        );
      } else {
        setAuthError(
          'Unable to sign in right now. Please check your Firebase configuration.',
        );
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);

      setAuthed(false);
      setEmail('');
      setPassword('');
      setAuthError('');
    } catch (error) {
      console.error(
        'Logout error:',
        error,
      );
    }
  };

  const dueToday =
    tasks.filter(
      (task) =>
        task.due ===
          today() &&
        task.status !== 'Done' &&
        task.status !==
          'Cancelled',
    );

  const overdue =
    tasks.filter(
      (task) =>
        task.due <
          today() &&
        task.status !== 'Done' &&
        task.status !==
          'Cancelled',
    );

  const waiting =
    tasks.filter(
      (task) =>
        task.status ===
        'Waiting',
    );

  const activeProjects =
    projects.filter(
      (project) =>
        project.status ===
        'Active',
    );

  const projectProgress = (
    projectId: string,
  ) => {
    const projectTasks =
      tasks.filter(
        (task) =>
          task.projectId ===
          projectId,
      );

    if (
      !projectTasks.length
    ) {
      return 0;
    }

    return Math.round(
      (projectTasks.filter(
        (task) =>
          task.status ===
          'Done',
      ).length /
        projectTasks.length) *
        100,
    );
  };

  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <div className="logo-mark">
              IW
            </div>

            <div>
              <b>
                Impact Water
              </b>

              <small>
                E-commerce & Growth OS
              </small>
            </div>
          </div>

          <p
            style={{
              textAlign:
                'center',
              marginTop: 24,
            }}
          >
            Checking your
            session…
          </p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <Login
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        authError={authError}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside
        className={
          'sidebar ' +
          (mobileOpen
            ? 'open'
            : '')
        }
      >
        <div className="brand">
          <div className="logo-mark">
            IW
          </div>

          <div className="brand-text">
            <b>
              Impact Water
            </b>

            <small>
              Growth OS
            </small>
          </div>
        </div>

        <div className="workspace">
          OPERATIONS WORKSPACE
        </div>

        {nav.map(
          ([name, Icon]) => (
            <button
              key={name}
              className={
                'nav-item ' +
                (page === name
                  ? 'active'
                  : '')
              }
              onClick={() => {
                setPage(name);
                setMobileOpen(
                  false,
                );
              }}
            >
              <Icon size={18} />

              <span className="nav-label">
                {name}
              </span>
            </button>
          ),
        )}

        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="avatar">
              J
            </div>

            <div className="nav-label">
              <b>
                Jagadeesh
              </b>

              <small>
                Founder&apos;s
                Office
              </small>
            </div>
          </div>

          <button
            className="nav-item"
            onClick={logout}
          >
            <X size={18} />

            <span className="nav-label">
              Log out
            </span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="scrim"
          onClick={() =>
            setMobileOpen(
              false,
            )
          }
        />
      )}

      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button
              className="mobile-menu btn"
              onClick={() =>
                setMobileOpen(
                  true,
                )
              }
            >
              <Menu size={18} />
            </button>

            <div className="crumb">
              {page}
            </div>
          </div>

          <div className="top-actions">
            <button
              className="search-trigger"
              onClick={() =>
                document
                  .getElementById(
                    'global-search',
                  )
                  ?.focus()
              }
            >
              <Search size={16} />

              Search

              <kbd>
                ⌘ K
              </kbd>
            </button>

            <button className="icon-btn">
              <Bell size={18} />
              <span className="dot" />
            </button>

            <button
              className="quick-add"
              onClick={() =>
                setShowAdd(
                  true,
                )
              }
            >
              <Plus size={17} />
              Add
            </button>
          </div>
        </header>

        <div className="content">
          {page ===
            'Dashboard' && (
            <Dashboard
              tasks={tasks}
              projects={projects}
              dueToday={
                dueToday
              }
              overdue={
                overdue
              }
              waiting={
                waiting
              }
              activeProjects={
                activeProjects
              }
              projectProgress={
                projectProgress
              }
              setTasks={
                setTasks
              }
              setPage={
                setPage
              }
            />
          )}

          {page === 'Tasks' && (
            <TasksPage
              tasks={tasks}
              projects={
                projects
              }
              setTasks={
                setTasks
              }
              query={query}
            />
          )}

          {page ===
            'Projects' && (
            <ProjectsPage
              projects={
                projects
              }
              tasks={tasks}
              setProjects={
                setProjects
              }
              projectProgress={
                projectProgress
              }
            />
          )}

          {page ===
            'E-Commerce' && (
            <EcommercePage
              ecommerce={
                ecommerce
              }
              setEcommerce={
                setEcommerce
              }
              orders={orders}
              setOrders={
                setOrders
              }
            />
          )}

          {page ===
            'Operations' && (
            <OperationsPage
              orders={orders}
              issues={issues}
              setIssues={
                setIssues
              }
            />
          )}

          {page === 'CRM' && (
            <CampaignPage
              campaigns={
                campaigns
              }
              setCampaigns={
                setCampaigns
              }
            />
          )}

          {page ===
            'Growth' && (
            <GrowthPage
              experiments={
                experiments
              }
              setExperiments={
                setExperiments
              }
            />
          )}

          {page ===
            'Website' && (
            <WebsitePage
              tasks={tasks}
              setTasks={
                setTasks
              }
              projects={
                projects
              }
            />
          )}

          {page ===
            'Reports' && (
            <Reports
              tasks={tasks}
              projects={
                projects
              }
              orders={orders}
              issues={issues}
              campaigns={
                campaigns
              }
              experiments={
                experiments
              }
            />
          )}

          {page === 'Notes' && (
            <NotesPage
              notes={notes}
              setNotes={
                setNotes
              }
              query={query}
            />
          )}

          {page ===
            'Settings' && (
            <SettingsPage />
          )}
        </div>
      </main>

      <div className="global-search">
        <input
          id="global-search"
          placeholder="Search tasks, projects, orders, notes…"
          value={query}
          onChange={(event) =>
            setQuery(
              event.target.value,
            )
          }
        />
      </div>

      {showAdd && (
        <QuickAdd
          onClose={() =>
            setShowAdd(
              false,
            )
          }
          setPage={setPage}
          setTasks={setTasks}
          setProjects={
            setProjects
          }
          setOrders={setOrders}
          setNotes={setNotes}
          setIssues={setIssues}
          setCampaigns={
            setCampaigns
          }
          setExperiments={
            setExperiments
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  tasks,
  projects,
  dueToday,
  overdue,
  waiting,
  activeProjects,
  projectProgress,
  setTasks,
  setPage,
}: {
  tasks: Task[];
  projects: Project[];
  dueToday: Task[];
  overdue: Task[];
  waiting: Task[];
  activeProjects: Project[];
  projectProgress: (
    id: string,
  ) => number;
  setTasks: Dispatch<
    SetStateAction<Task[]>
  >;
  setPage: (
    page: string,
  ) => void;
}) {
  const priorityTasks =
    tasks
      .filter(
        (task) =>
          task.status !==
            'Done' &&
          task.status !==
            'Cancelled',
      )
      .sort(
        (a, b) =>
          priorities.indexOf(
            a.priority,
          ) -
          priorities.indexOf(
            b.priority,
          ),
      )
      .slice(0, 4);

  const completeTask = (
    id: string,
  ) => {
    setTasks(
      (items) =>
        items.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  status:
                    'Done',
                  updated:
                    today(),
                }
              : item,
        ),
    );
  };

  return (
    <>
      <PageTitle
        eyebrow="Today"
        title="Good evening, Jagadeesh."
        desc="Here’s what needs your attention today."
        action={
          <button
            className="btn btn-primary"
            onClick={() =>
              setPage('Tasks')
            }
          >
            Open task board
          </button>
        }
      />

      <div className="stats grid-6">
        <Stat
          label="Open tasks"
          value={
            tasks.filter(
              (task) =>
                ![
                  'Done',
                  'Cancelled',
                ].includes(
                  task.status,
                ),
            ).length
          }
          icon={ClipboardList}
        />

        <Stat
          label="Due today"
          value={
            dueToday.length
          }
          icon={Clock3}
          tone="orange"
        />

        <Stat
          label="Overdue"
          value={
            overdue.length
          }
          icon={AlertCircle}
          tone="red"
        />

        <Stat
          label="Waiting"
          value={
            waiting.length
          }
          icon={Truck}
          tone="yellow"
        />

        <Stat
          label="Completed today"
          value={
            tasks.filter(
              (task) =>
                task.status ===
                  'Done' &&
                task.updated ===
                  today(),
            ).length
          }
          icon={
            CheckCircle2
          }
          tone="green"
        />

        <Stat
          label="Active projects"
          value={
            activeProjects.length
          }
          icon={
            FolderKanban
          }
        />
      </div>

      <div className="dashboard-grid">
        <section className="card section">
          <SectionHead
            title="Needs attention"
            icon={Zap}
          />

          {priorityTasks.map(
            (task) => (
              <TaskRow
                key={task.id}
                task={task}
                onDone={() =>
                  completeTask(
                    task.id,
                  )
                }
              />
            ),
          )}

          {!priorityTasks.length && (
            <Empty text="Nothing needs immediate attention." />
          )}
        </section>

        <section className="card section">
          <SectionHead
            title="My tasks today"
            icon={
              ClipboardList
            }
          />

          {dueToday.length ? (
            dueToday.map(
              (task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onDone={() =>
                    completeTask(
                      task.id,
                    )
                  }
                />
              ),
            )
          ) : (
            <Empty text="Nothing due today." />
          )}
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="card section">
          <SectionHead
            title="Active projects"
            icon={
              FolderKanban
            }
            action={
              <button
                className="link"
                onClick={() =>
                  setPage(
                    'Projects',
                  )
                }
              >
                View all
              </button>
            }
          />

          {activeProjects.map(
            (project) => (
              <div
                className="project-row"
                key={
                  project.id
                }
              >
                <div className="project-main">
                  <div className="project-icon">
                    <BriefcaseBusiness
                      size={16}
                    />
                  </div>

                  <div>
                    <b>
                      {
                        project.name
                      }
                    </b>

                    <small>
                      {
                        project.category
                      }{' '}
                      · Due{' '}
                      {
                        project.due
                      }
                    </small>
                  </div>
                </div>

                <div className="progress-wrap">
                  <div className="progress-line">
                    <span
                      style={{
                        width: `${projectProgress(
                          project.id,
                        )}%`,
                      }}
                    />
                  </div>

                  <small>
                    {projectProgress(
                      project.id,
                    )}
                    %
                  </small>
                </div>
              </div>
            ),
          )}
        </section>

        <section className="card section">
          <SectionHead
            title="Waiting on others"
            icon={Truck}
          />

          {waiting.length ? (
            waiting.map(
              (task) => (
                <div
                  className="waiting-row"
                  key={
                    task.id
                  }
                >
                  <div>
                    <b>
                      {
                        task.title
                      }
                    </b>

                    <small>
                      {task.description ||
                        'Waiting for another team or partner.'}
                    </small>
                  </div>

                  <Badge tone="yellow">
                    Waiting
                  </Badge>
                </div>
              ),
            )
          ) : (
            <Empty text="No waiting tasks." />
          )}
        </section>
      </div>
    </>
  );
}

/* =========================================================
   TASKS
========================================================= */

function TasksPage({
  tasks,
  projects,
  setTasks,
  query,
}: {
  tasks: Task[];
  projects: Project[];
  setTasks: Dispatch<
    SetStateAction<Task[]>
  >;
  query: string;
}) {
  const [status, setStatus] =
    useState('All');

  const [priority, setPriority] =
    useState('All');

  const [modal, setModal] =
    useState(false);

  const [editing, setEditing] =
    useState<Task | null>(null);

  const filtered =
    tasks.filter(
      (task) =>
        (!query ||
          `${task.title} ${task.description} ${task.tags.join(
            ' ',
          )}`
            .toLowerCase()
            .includes(
              query.toLowerCase(),
            )) &&
        (status === 'All' ||
          task.status ===
            status) &&
        (priority === 'All' ||
          task.priority ===
            priority),
    );

  const saveTask = (
    task: Task,
  ) => {
    setTasks(
      (items) =>
        items.some(
          (item) =>
            item.id ===
            task.id,
        )
          ? items.map(
              (item) =>
                item.id ===
                task.id
                  ? task
                  : item,
            )
          : [
              task,
              ...items,
            ],
    );

    setModal(false);
    setEditing(null);
  };

  return (
    <>
      <PageTitle
        eyebrow="Work management"
        title="Tasks"
        desc="Keep execution moving, with waiting and blocked work visible."
        action={
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setModal(true);
            }}
          >
            New task
          </button>
        }
      />

      <div className="toolbar">
        <div className="searchbox">
          <Search size={16} />

          <input
            placeholder="Search tasks…"
            value={query}
            readOnly
          />
        </div>

        <select
          className="select compact"
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value,
            )
          }
        >
          <option>
            All
          </option>

          {statuses.map(
            (item) => (
              <option
                key={item}
              >
                {item}
              </option>
            ),
          )}
        </select>

        <select
          className="select compact"
          value={priority}
          onChange={(event) =>
            setPriority(
              event.target.value,
            )
          }
        >
          <option>
            All
          </option>

          {priorities.map(
            (item) => (
              <option
                key={item}
              >
                {item}
              </option>
            ),
          )}
        </select>

        <span className="result-count">
          {filtered.length}{' '}
          tasks
        </span>
      </div>

      <div className="card task-table">
        {filtered.map(
          (task) => (
            <div
              className="table-task"
              key={task.id}
            >
              <button
                className="check"
                onClick={() =>
                  setTasks(
                    (items) =>
                      items.map(
                        (item) =>
                          item.id ===
                          task.id
                            ? {
                                ...item,
                                status:
                                  item.status ===
                                  'Done'
                                    ? 'To Do'
                                    : 'Done',
                                updated:
                                  today(),
                              }
                            : item,
                      ),
                  )
                }
              >
                {task.status ===
                'Done' ? (
                  <CheckCircle2
                    size={20}
                  />
                ) : (
                  <CircleDot
                    size={20}
                  />
                )}
              </button>

              <div className="task-copy">
                <b>
                  {task.title}
                </b>

                <small>
                  {projects.find(
                    (
                      project,
                    ) =>
                      project.id ===
                      task.projectId,
                  )?.name ||
                    'No project'}{' '}
                  · {task.due}
                </small>

                <div>
                  {task.tags.map(
                    (tag) => (
                      <span
                        className="tag"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ),
                  )}

                  {task.subtasks
                    .length >
                    0 && (
                    <span className="tag">
                      {
                        task.subtasks.filter(
                          (
                            subtask,
                          ) =>
                            subtask.done,
                        ).length
                      }
                      /
                      {
                        task
                          .subtasks
                          .length
                      }{' '}
                      subtasks
                    </span>
                  )}
                </div>
              </div>

              <Badge
                tone={priorityTone(
                  task.priority,
                )}
              >
                {task.priority}
              </Badge>

              <Badge
                tone={statusTone(
                  task.status,
                )}
              >
                {task.status}
              </Badge>

              <button
                className="icon-btn small"
                onClick={() => {
                  setEditing(
                    task,
                  );
                  setModal(true);
                }}
              >
                <MoreHorizontal
                  size={17}
                />
              </button>
            </div>
          ),
        )}

        {!filtered.length && (
          <Empty text="No tasks match these filters." />
        )}
      </div>

      {modal && (
        <TaskModal
          task={editing}
          projects={
            projects
          }
          onClose={() =>
            setModal(false)
          }
          onSave={
            saveTask
          }
          onDelete={(
            id,
          ) => {
            setTasks(
              (items) =>
                items.filter(
                  (item) =>
                    item.id !==
                    id,
                ),
            );

            setModal(false);
          }}
        />
      )}
    </>
  );
}

function TaskModal({
  task,
  projects,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task | null;
  projects: Project[];
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const [currentTask, setCurrentTask] =
    useState<Task>(
      task || {
        id: uid(),
        title: '',
        description: '',
        projectId:
          projects[0]?.id ||
          '',
        status: 'To Do',
        priority: 'Medium',
        due: today(),
        tags: [],
        subtasks: [],
        created: today(),
        updated: today(),
      },
    );

  const [subtask, setSubtask] =
    useState('');

  return (
    <Modal
      title={
        task
          ? 'Edit task'
          : 'New task'
      }
      onClose={onClose}
    >
      <label>
        Task name

        <input
          className="input"
          value={
            currentTask.title
          }
          onChange={(
            event,
          ) =>
            setCurrentTask({
              ...currentTask,
              title:
                event.target
                  .value,
            })
          }
        />
      </label>

      <label>
        Description

        <textarea
          className="textarea"
          rows={3}
          value={
            currentTask.description
          }
          onChange={(
            event,
          ) =>
            setCurrentTask({
              ...currentTask,
              description:
                event.target
                  .value,
            })
          }
        />
      </label>

      <div className="form-grid">
        <label>
          Project

          <select
            className="select"
            value={
              currentTask.projectId
            }
            onChange={(
              event,
            ) =>
              setCurrentTask({
                ...currentTask,
                projectId:
                  event.target
                    .value,
              })
            }
          >
            {projects.map(
              (project) => (
                <option
                  key={
                    project.id
                  }
                  value={
                    project.id
                  }
                >
                  {
                    project.name
                  }
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          Status

          <select
            className="select"
            value={
              currentTask.status
            }
            onChange={(
              event,
            ) =>
              setCurrentTask({
                ...currentTask,
                status:
                  event.target
                    .value as Status,
              })
            }
          >
            {statuses.map(
              (status) => (
                <option
                  key={status}
                >
                  {status}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          Priority

          <select
            className="select"
            value={
              currentTask.priority
            }
            onChange={(
              event,
            ) =>
              setCurrentTask({
                ...currentTask,
                priority:
                  event.target
                    .value as Priority,
              })
            }
          >
            {priorities.map(
              (priority) => (
                <option
                  key={priority}
                >
                  {priority}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          Due date

          <input
            className="input"
            type="date"
            value={
              currentTask.due
            }
            onChange={(
              event,
            ) =>
              setCurrentTask({
                ...currentTask,
                due:
                  event.target
                    .value,
              })
            }
          />
        </label>
      </div>

      <label>
        Tags

        <input
          className="input"
          value={currentTask.tags.join(
            ', ',
          )}
          onChange={(
            event,
          ) =>
            setCurrentTask({
              ...currentTask,
              tags: event.target.value
                .split(',')
                .map(
                  (item) =>
                    item.trim(),
                )
                .filter(
                  Boolean,
                ),
            })
          }
        />
      </label>

      <div className="subtask-editor">
        <b>
          Subtasks
        </b>

        {currentTask.subtasks.map(
          (item) => (
            <div
              className="subline"
              key={item.id}
            >
              <input
                type="checkbox"
                checked={
                  item.done
                }
                onChange={(
                  event,
                ) =>
                  setCurrentTask({
                    ...currentTask,
                    subtasks:
                      currentTask.subtasks.map(
                        (
                          subtaskItem,
                        ) =>
                          subtaskItem.id ===
                          item.id
                            ? {
                                ...subtaskItem,
                                done: event
                                  .target
                                  .checked,
                              }
                            : subtaskItem,
                      ),
                  })
                }
              />

              <span>
                {item.title}
              </span>

              <button
                className="link danger"
                onClick={() =>
                  setCurrentTask({
                    ...currentTask,
                    subtasks:
                      currentTask.subtasks.filter(
                        (
                          subtaskItem,
                        ) =>
                          subtaskItem.id !==
                          item.id,
                      ),
                  })
                }
              >
                Remove
              </button>
            </div>
          ),
        )}

        <div className="inline-add">
          <input
            className="input"
            placeholder="Add subtask"
            value={
              subtask
            }
            onChange={(
              event,
            ) =>
              setSubtask(
                event.target
                  .value,
              )
            }
          />

          <button
            className="btn"
            onClick={() => {
              if (
                !subtask.trim()
              ) {
                return;
              }

              setCurrentTask({
                ...currentTask,
                subtasks: [
                  ...currentTask.subtasks,
                  {
                    id: uid(),
                    title:
                      subtask.trim(),
                    done: false,
                  },
                ],
              });

              setSubtask('');
            }}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="modal-actions">
        {task && (
          <button
            className="btn danger-btn"
            onClick={() =>
              onDelete(
                currentTask.id,
              )
            }
          >
            Delete
          </button>
        )}

        <span />

        <button
          className="btn"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          disabled={
            !currentTask.title.trim()
          }
          onClick={() =>
            onSave({
              ...currentTask,
              updated:
                today(),
            })
          }
        >
          Save task
        </button>
      </div>
    </Modal>
  );
}

/* =========================================================
   PROJECTS
========================================================= */

function ProjectsPage({
  projects,
  tasks,
  setProjects,
  projectProgress,
}: {
  projects: Project[];
  tasks: Task[];
  setProjects: Dispatch<
    SetStateAction<Project[]>
  >;
  projectProgress: (
    id: string,
  ) => number;
}) {
  const [modal, setModal] =
    useState(false);

  const [editing, setEditing] =
    useState<Project | null>(
      null,
    );

  const saveProject = (
    project: Project,
  ) => {
    setProjects(
      (items) =>
        items.some(
          (item) =>
            item.id ===
            project.id,
        )
          ? items.map(
              (item) =>
                item.id ===
                project.id
                  ? project
                  : item,
            )
          : [
              project,
              ...items,
            ],
    );

    setModal(false);
    setEditing(null);
  };

  return (
    <>
      <PageTitle
        eyebrow="Portfolio"
        title="Projects"
        desc="Organize initiatives across e-commerce, operations, CRM and growth."
        action={
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setModal(true);
            }}
          >
            New project
          </button>
        }
      />

      <div className="project-grid">
        {projects.map(
          (project) => (
            <div
              className="card project-card"
              key={
                project.id
              }
            >
              <div className="project-card-top">
                <div className="project-icon large">
                  <FolderKanban
                    size={20}
                  />
                </div>

                <button
                  className="icon-btn small"
                  onClick={() => {
                    setEditing(
                      project,
                    );
                    setModal(true);
                  }}
                >
                  <MoreHorizontal
                    size={17}
                  />
                </button>
              </div>

              <div className="eyebrow">
                {
                  project.category
                }
              </div>

              <h3>
                {project.name}
              </h3>

              <p>
                {
                  project.description
                }
              </p>

              <div className="project-meta">
                <Badge
                  tone={statusTone(
                    project.status,
                  )}
                >
                  {
                    project.status
                  }
                </Badge>

                <Badge
                  tone={priorityTone(
                    project.priority,
                  )}
                >
                  {
                    project.priority
                  }
                </Badge>
              </div>

              <div className="progress-line">
                <span
                  style={{
                    width: `${projectProgress(
                      project.id,
                    )}%`,
                  }}
                />
              </div>

              <div className="project-footer">
                <b>
                  {projectProgress(
                    project.id,
                  )}
                  % complete
                </b>

                <span>
                  {
                    tasks.filter(
                      (task) =>
                        task.projectId ===
                          project.id &&
                        ![
                          'Done',
                          'Cancelled',
                        ].includes(
                          task.status,
                        ),
                    ).length
                  }{' '}
                  open tasks
                </span>
              </div>

              <small>
                Due{' '}
                {
                  project.due
                }
              </small>
            </div>
          ),
        )}
      </div>

      {modal && (
        <ProjectModal
          project={
            editing
          }
          onClose={() =>
            setModal(false)
          }
          onSave={
            saveProject
          }
          onDelete={(
            id,
          ) => {
            setProjects(
              (items) =>
                items.filter(
                  (item) =>
                    item.id !==
                    id,
                ),
            );

            setModal(false);
          }}
        />
      )}
    </>
  );
}

function ProjectModal({
  project,
  onClose,
  onSave,
  onDelete,
}: {
  project: Project | null;
  onClose: () => void;
  onSave: (
    project: Project,
  ) => void;
  onDelete: (
    id: string,
  ) => void;
}) {
  const [currentProject, setCurrentProject] =
    useState<Project>(
      project || {
        id: uid(),
        name: '',
        description: '',
        status:
          'Planning',
        priority:
          'Medium',
        category:
          'E-Commerce',
        due: today(),
        goals: '',
      },
    );

  return (
    <Modal
      title={
        project
          ? 'Edit project'
          : 'New project'
      }
      onClose={onClose}
    >
      <label>
        Project name

        <input
          className="input"
          value={
            currentProject.name
          }
          onChange={(
            event,
          ) =>
            setCurrentProject({
              ...currentProject,
              name: event.target
                .value,
            })
          }
        />
      </label>

      <label>
        Description

        <textarea
          className="textarea"
          rows={3}
          value={
            currentProject.description
          }
          onChange={(
            event,
          ) =>
            setCurrentProject({
              ...currentProject,
              description:
                event.target
                  .value,
            })
          }
        />
      </label>

      <div className="form-grid">
        <label>
          Category

          <select
            className="select"
            value={
              currentProject.category
            }
            onChange={(
              event,
            ) =>
              setCurrentProject({
                ...currentProject,
                category:
                  event.target
                    .value,
              })
            }
          >
            {[
              'E-Commerce',
              'Operations',
              'CRM',
              'Growth',
              'Custom',
            ].map(
              (item) => (
                <option
                  key={item}
                >
                  {item}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          Status

          <select
            className="select"
            value={
              currentProject.status
            }
            onChange={(
              event,
            ) =>
              setCurrentProject({
                ...currentProject,
                status:
                  event.target
                    .value as ProjectStatus,
              })
            }
          >
            {projectStatuses.map(
              (status) => (
                <option
                  key={status}
                >
                  {status}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          Priority

          <select
            className="select"
            value={
              currentProject.priority
            }
            onChange={(
              event,
            ) =>
              setCurrentProject({
                ...currentProject,
                priority:
                  event.target
                    .value as Priority,
              })
            }
          >
            {priorities.map(
              (priority) => (
                <option
                  key={
                    priority
                  }
                >
                  {priority}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          Due date

          <input
            className="input"
            type="date"
            value={
              currentProject.due
            }
            onChange={(
              event,
            ) =>
              setCurrentProject({
                ...currentProject,
                due:
                  event.target
                    .value,
              })
            }
          />
        </label>
      </div>

      <label>
        Goals

        <textarea
          className="textarea"
          rows={3}
          value={
            currentProject.goals
          }
          onChange={(
            event,
          ) =>
            setCurrentProject({
              ...currentProject,
              goals:
                event.target
                  .value,
            })
          }
        />
      </label>

      <div className="modal-actions">
        {project && (
          <button
            className="btn danger-btn"
            onClick={() =>
              onDelete(
                currentProject.id,
              )
            }
          >
            Delete
          </button>
        )}

        <span />

        <button
          className="btn"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          disabled={
            !currentProject.name.trim()
          }
          onClick={() =>
            onSave(
              currentProject,
            )
          }
        >
          Save project
        </button>
      </div>
    </Modal>
  );
}

/* =========================================================
   E-COMMERCE
========================================================= */

function EcommercePage({
  ecommerce,
  setEcommerce,
  orders,
}: {
  ecommerce: Ecommerce[];
  setEcommerce: Dispatch<
    SetStateAction<Ecommerce[]>
  >;
  orders: Order[];
  setOrders: Dispatch<
    SetStateAction<Order[]>
  >;
}) {
  const revenue =
    ecommerce.reduce(
      (sum, item) =>
        sum + item.revenue,
      0,
    );

  const orderCount =
    ecommerce.reduce(
      (sum, item) =>
        sum + item.orders,
      0,
    );

  const aov = orderCount
    ? Math.round(
        revenue /
          orderCount,
      )
    : 0;

  return (
    <>
      <PageTitle
        eyebrow="Commerce control center"
        title="E-Commerce"
        desc="Manual marketplace tracking now; integration-ready for later."
        action={
          <button
            className="btn btn-primary"
            onClick={() =>
              setEcommerce(
                (items) => [
                  {
                    id: uid(),
                    marketplace:
                      'Other',
                    date: today(),
                    orders: 0,
                    revenue: 0,
                    units: 0,
                    cancellations: 0,
                    returns: 0,
                    stockouts: 0,
                    notes: '',
                  },
                  ...items,
                ],
              )
            }
          >
            Add record
          </button>
        }
      />

      <div className="stats grid-4">
        <Stat
          label="Orders"
          value={orderCount}
          icon={
            ShoppingCart
          }
        />

        <Stat
          label="Revenue"
          value={`₹${revenue.toLocaleString(
            'en-IN',
          )}`}
          icon={BarChart3}
          tone="green"
        />

        <Stat
          label="AOV"
          value={`₹${aov.toLocaleString(
            'en-IN',
          )}`}
          icon={Gauge}
          tone="purple"
        />

        <Stat
          label="Stock-outs"
          value={ecommerce.reduce(
            (sum, item) =>
              sum +
              item.stockouts,
            0,
          )}
          icon={Package}
          tone="orange"
        />
      </div>

      <div className="card section">
        <SectionHead
          title="Marketplace performance"
          icon={
            ShoppingCart
          }
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  Marketplace
                </th>
                <th>
                  Date
                </th>
                <th>
                  Orders
                </th>
                <th>
                  Revenue
                </th>
                <th>
                  Units
                </th>
                <th>
                  AOV
                </th>
                <th>
                  Cancels
                </th>
                <th>
                  Returns
                </th>
                <th>
                  Stock-outs
                </th>
              </tr>
            </thead>

            <tbody>
              {ecommerce.map(
                (item) => (
                  <tr
                    key={
                      item.id
                    }
                  >
                    <td>
                      <b>
                        {
                          item.marketplace
                        }
                      </b>
                    </td>

                    <td>
                      {item.date}
                    </td>

                    <td>
                      {
                        item.orders
                      }
                    </td>

                    <td>
                      ₹
                      {item.revenue.toLocaleString(
                        'en-IN',
                      )}
                    </td>

                    <td>
                      {
                        item.units
                      }
                    </td>

                    <td>
                      ₹
                      {item.orders
                        ? Math.round(
                            item.revenue /
                              item.orders,
                          ).toLocaleString(
                            'en-IN',
                          )
                        : '0'}
                    </td>

                    <td>
                      {
                        item.cancellations
                      }
                    </td>

                    <td>
                      {
                        item.returns
                      }
                    </td>

                    <td>
                      {
                        item.stockouts
                      }
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card section">
        <SectionHead
          title="RO / Order tracker"
          icon={Truck}
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>RO</th>
                <th>
                  Marketplace
                </th>
                <th>
                  Product
                </th>
                <th>
                  Amount
                </th>
                <th>
                  Invoice
                </th>
                <th>
                  Shipment
                </th>
                <th>
                  Overall
                </th>
                <th>
                  Priority
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map(
                (order) => (
                  <tr
                    key={
                      order.id
                    }
                  >
                    <td>
                      <b>
                        {
                          order.id
                        }
                      </b>
                    </td>

                    <td>
                      {
                        order.marketplace
                      }
                    </td>

                    <td>
                      {
                        order.product
                      }{' '}
                      ×{' '}
                      {order.qty}
                    </td>

                    <td>
                      ₹
                      {order.amount.toLocaleString(
                        'en-IN',
                      )}
                    </td>

                    <td>
                      <Badge
                        tone={statusTone(
                          order.invoice,
                        )}
                      >
                        {
                          order.invoice
                        }
                      </Badge>
                    </td>

                    <td>
                      <Badge
                        tone={statusTone(
                          order.shipment,
                        )}
                      >
                        {
                          order.shipment
                        }
                      </Badge>
                    </td>

                    <td>
                      <Badge
                        tone={statusTone(
                          order.overall,
                        )}
                      >
                        {
                          order.overall
                        }
                      </Badge>
                    </td>

                    <td>
                      <Badge
                        tone={priorityTone(
                          order.priority,
                        )}
                      >
                        {
                          order.priority
                        }
                      </Badge>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   OPERATIONS
========================================================= */

function OperationsPage({
  orders,
  issues,
  setIssues,
}: {
  orders: Order[];
  issues: Issue[];
  setIssues: Dispatch<
    SetStateAction<Issue[]>
  >;
}) {
  const pending =
    orders.filter(
      (item) =>
        item.overall ===
          'New' ||
        item.overall ===
          'Processing',
    );

  const waiting =
    orders.filter(
      (item) =>
        item.overall ===
        'Waiting',
    );

  const shipment =
    orders.filter(
      (item) =>
        item.shipment ===
          'Waiting' ||
        item.shipment ===
          'Failed',
    );

  const invoice =
    orders.filter(
      (item) =>
        item.invoice ===
        'Pending',
    );

  return (
    <>
      <PageTitle
        eyebrow="Fulfillment control"
        title="Operations"
        desc="Track pending, waiting, shipment and invoice issues."
      />

      <div className="ops-grid">
        <Stat
          label="Pending"
          value={
            pending.length
          }
          icon={Clock3}
          tone="orange"
        />

        <Stat
          label="Waiting"
          value={
            waiting.length
          }
          icon={Truck}
          tone="yellow"
        />

        <Stat
          label="Shipment issues"
          value={
            shipment.length
          }
          icon={
            AlertCircle
          }
          tone="red"
        />

        <Stat
          label="Invoice issues"
          value={
            invoice.length
          }
          icon={FileText}
          tone="purple"
        />
      </div>

      <div className="card section">
        <SectionHead
          title="Issues"
          icon={
            AlertCircle
          }
          action={
            <button
              className="btn"
              onClick={() =>
                setIssues(
                  (items) => [
                    {
                      id: uid(),
                      title:
                        'New operational issue',
                      order: '',
                      category:
                        'Internal',
                      owner: '',
                      priority:
                        'Medium',
                      status:
                        'Open',
                      due: today(),
                      resolution:
                        '',
                      notes: '',
                    },
                    ...items,
                  ],
                )
              }
            >
              <Plus size={15} />
              Add issue
            </button>
          }
        />

        <div className="issue-list">
          {issues.map(
            (issue) => (
              <div
                className="issue-row"
                key={
                  issue.id
                }
              >
                <div className="issue-icon">
                  <AlertCircle
                    size={17}
                  />
                </div>

                <div className="issue-main">
                  <b>
                    {
                      issue.title
                    }
                  </b>

                  <small>
                    {
                      issue.category
                    }{' '}
                    ·{' '}
                    {issue.order ||
                      'No order'}{' '}
                    · Due{' '}
                    {
                      issue.due
                    }
                  </small>
                </div>

                <Badge
                  tone={priorityTone(
                    issue.priority,
                  )}
                >
                  {
                    issue.priority
                  }
                </Badge>

                <Badge
                  tone={statusTone(
                    issue.status,
                  )}
                >
                  {
                    issue.status
                  }
                </Badge>

                <button
                  className="btn small-btn"
                  onClick={() =>
                    setIssues(
                      (items) =>
                        items.map(
                          (
                            item,
                          ) =>
                            item.id ===
                            issue.id
                              ? {
                                  ...item,
                                  status:
                                    item.status ===
                                    'Open'
                                      ? 'Resolved'
                                      : 'Open',
                                  resolution:
                                    item.status ===
                                    'Open'
                                      ? 'Resolved by user'
                                      : '',
                                }
                              : item,
                        ),
                    )
                  }
                >
                  {issue.status ===
                  'Open'
                    ? 'Resolve'
                    : 'Reopen'}
                </button>
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   CRM
========================================================= */

function CampaignPage({
  campaigns,
  setCampaigns,
}: {
  campaigns: Campaign[];
  setCampaigns: Dispatch<
    SetStateAction<Campaign[]>
  >;
}) {
  return (
    <>
      <PageTitle
        eyebrow="Customer retention"
        title="CRM / OmniFlow planner"
        desc="Plan campaigns without pretending there is a live OmniFlow connection."
        action={
          <button
            className="btn btn-primary"
            onClick={() =>
              setCampaigns(
                (items) => [
                  {
                    id: uid(),
                    name:
                      'New campaign',
                    type:
                      'Reorder',
                    audience:
                      '',
                    start:
                      today(),
                    end:
                      today(),
                    status:
                      'Idea',
                    targeted: 0,
                    sent: 0,
                    delivered: 0,
                    clicks: 0,
                    orders: 0,
                    revenue: 0,
                    notes: '',
                    results: '',
                    learnings:
                      '',
                  },
                  ...items,
                ],
              )
            }
          >
            New campaign
          </button>
        }
      />

      <div className="card section">
        <div className="campaign-grid">
          {campaigns.map(
            (campaign) => (
              <div
                className="campaign-card"
                key={
                  campaign.id
                }
              >
                <div className="campaign-top">
                  <Badge
                    tone={statusTone(
                      campaign.status,
                    )}
                  >
                    {
                      campaign.status
                    }
                  </Badge>

                  <span>
                    {
                      campaign.type
                    }
                  </span>
                </div>

                <h3>
                  {
                    campaign.name
                  }
                </h3>

                <p>
                  {campaign.audience ||
                    'Audience not defined yet.'}
                </p>

                <div className="metrics-mini">
                  <div>
                    <b>
                      {campaign.targeted.toLocaleString()}
                    </b>
                    <small>
                      Targeted
                    </small>
                  </div>

                  <div>
                    <b>
                      {campaign.sent.toLocaleString()}
                    </b>
                    <small>
                      Sent
                    </small>
                  </div>

                  <div>
                    <b>
                      {
                        campaign.orders
                      }
                    </b>
                    <small>
                      Orders
                    </small>
                  </div>

                  <div>
                    <b>
                      ₹
                      {campaign.revenue.toLocaleString(
                        'en-IN',
                      )}
                    </b>
                    <small>
                      Revenue
                    </small>
                  </div>
                </div>

                <div className="campaign-footer">
                  {
                    campaign.start
                  }{' '}
                  →{' '}
                  {
                    campaign.end
                  }

                  <select
                    className="select tiny"
                    value={
                      campaign.status
                    }
                    onChange={(
                      event,
                    ) =>
                      setCampaigns(
                        (items) =>
                          items.map(
                            (
                              item,
                            ) =>
                              item.id ===
                              campaign.id
                                ? {
                                    ...item,
                                    status:
                                      event
                                        .target
                                        .value,
                                  }
                                : item,
                          ),
                      )
                    }
                  >
                    {[
                      'Idea',
                      'Planned',
                      'Scheduled',
                      'Running',
                      'Completed',
                      'Cancelled',
                    ].map(
                      (
                        status,
                      ) => (
                        <option
                          key={
                            status
                          }
                        >
                          {
                            status
                          }
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   GROWTH
========================================================= */

function GrowthPage({
  experiments,
  setExperiments,
}: {
  experiments: Experiment[];
  setExperiments: Dispatch<
    SetStateAction<Experiment[]>
  >;
}) {
  return (
    <>
      <PageTitle
        eyebrow="Growth Lab"
        title="Experiments"
        desc="Record hypotheses, baselines, targets and learnings. Outcomes stay data-led."
        action={
          <button
            className="btn btn-primary"
            onClick={() =>
              setExperiments(
                (items) => [
                  {
                    id: uid(),
                    name:
                      'New experiment',
                    hypothesis:
                      '',
                    problem:
                      '',
                    action:
                      '',
                    channel:
                      'Website',
                    start:
                      today(),
                    end:
                      today(),
                    metric:
                      'Orders',
                    baseline:
                      '',
                    target:
                      '',
                    result:
                      '',
                    learning:
                      '',
                    decision:
                      'Continue',
                  },
                  ...items,
                ],
              )
            }
          >
            New experiment
          </button>
        }
      />

      <div className="experiment-grid">
        {experiments.map(
          (experiment) => (
            <div
              className="card experiment-card"
              key={
                experiment.id
              }
            >
              <div className="experiment-head">
                <Sparkles
                  size={18}
                />

                <Badge tone="purple">
                  {
                    experiment.channel
                  }
                </Badge>
              </div>

              <h3>
                {
                  experiment.name
                }
              </h3>

              <div className="experiment-section">
                <small>
                  HYPOTHESIS
                </small>

                <p>
                  {experiment.hypothesis ||
                    'Add a testable hypothesis.'}
                </p>
              </div>

              <div className="experiment-section">
                <small>
                  PROPOSED ACTION
                </small>

                <p>
                  {experiment.action ||
                    'Define what will change.'}
                </p>
              </div>

              <div className="experiment-metrics">
                <div>
                  <small>
                    Metric
                  </small>

                  <b>
                    {
                      experiment.metric
                    }
                  </b>
                </div>

                <div>
                  <small>
                    Baseline
                  </small>

                  <b>
                    {experiment.baseline ||
                      '—'}
                  </b>
                </div>

                <div>
                  <small>
                    Target
                  </small>

                  <b>
                    {experiment.target ||
                      '—'}
                  </b>
                </div>

                <div>
                  <small>
                    Result
                  </small>

                  <b>
                    {experiment.result ||
                      'Not recorded'}
                  </b>
                </div>
              </div>

              <label className="decision">
                Decision

                <select
                  className="select"
                  value={
                    experiment.decision
                  }
                  onChange={(
                    event,
                  ) =>
                    setExperiments(
                      (items) =>
                        items.map(
                          (
                            item,
                          ) =>
                            item.id ===
                            experiment.id
                              ? {
                                  ...item,
                                  decision:
                                    event
                                      .target
                                      .value,
                                }
                              : item,
                        ),
                    )
                  }
                >
                  {[
                    'Continue',
                    'Modify',
                    'Stop',
                  ].map(
                    (
                      decision,
                    ) => (
                      <option
                        key={
                          decision
                        }
                      >
                        {
                          decision
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <textarea
                className="textarea"
                rows={2}
                placeholder="Learning / result"
                value={
                  experiment.learning
                }
                onChange={(
                  event,
                ) =>
                  setExperiments(
                    (items) =>
                      items.map(
                        (
                          item,
                        ) =>
                          item.id ===
                          experiment.id
                            ? {
                                ...item,
                                learning:
                                  event
                                    .target
                                    .value,
                              }
                            : item,
                      ),
                  )
                }
              />
            </div>
          ),
        )}
      </div>
    </>
  );
}

/* =========================================================
   WEBSITE
========================================================= */

function WebsitePage({
  tasks,
  setTasks,
  projects,
}: {
  tasks: Task[];
  setTasks: Dispatch<
    SetStateAction<Task[]>
  >;
  projects: Project[];
}) {
  const items =
    tasks.filter(
      (task) =>
        task.tags.some(
          (tag) =>
            [
              'Website',
              'SEO',
              'Content',
              'Pricing',
            ].includes(tag),
        ),
    );

  return (
    <>
      <PageTitle
        eyebrow="Website control center"
        title="Website"
        desc="Manage website work without directly modifying the live company website."
        action={
          <button
            className="btn btn-primary"
            onClick={() =>
              setTasks(
                (existing) => [
                  {
                    id: uid(),
                    title:
                      'New website task',
                    description:
                      '',
                    projectId:
                      projects.find(
                        (
                          project,
                        ) =>
                          project.category ===
                          'Growth',
                      )?.id ||
                      projects[0]
                        ?.id ||
                      '',
                    status:
                      'To Do',
                    priority:
                      'Medium',
                    due: today(),
                    tags: [
                      'Website',
                    ],
                    subtasks:
                      [],
                    created:
                      today(),
                    updated:
                      today(),
                  },
                  ...existing,
                ],
              )
            }
          >
            Add website task
          </button>
        }
      />

      <div className="category-strip">
        {[
          'Website issues',
          'Product updates',
          'Pricing changes',
          'Landing pages',
          'SEO tasks',
          'Conversion improvements',
          'Content',
          'Promotions',
          'Technical issues',
        ].map(
          (item) => (
            <div
              className="category-card"
              key={item}
            >
              <Globe2 size={16} />

              <span>
                {item}
              </span>
            </div>
          ),
        )}
      </div>

      <div className="card section">
        <SectionHead
          title="Website work"
          icon={Globe2}
        />

        {items.length ? (
          items.map(
            (task) => (
              <TaskRow
                key={task.id}
                task={task}
                onDone={() =>
                  setTasks(
                    (
                      existing,
                    ) =>
                      existing.map(
                        (
                          item,
                        ) =>
                          item.id ===
                          task.id
                            ? {
                                ...item,
                                status:
                                  'Done',
                                updated:
                                  today(),
                              }
                            : item,
                      ),
                  )
                }
              />
            ),
          )
        ) : (
          <Empty text="No website tasks yet." />
        )}
      </div>
    </>
  );
}

/* =========================================================
   NOTES
========================================================= */

function NotesPage({
  notes,
  setNotes,
  query,
}: {
  notes: Note[];
  setNotes: Dispatch<
    SetStateAction<Note[]>
  >;
  query: string;
}) {
  const [editing, setEditing] =
    useState<Note | null>(
      null,
    );

  const filtered =
    notes.filter(
      (note) =>
        !query ||
        `${note.title} ${note.body} ${note.tag}`
          .toLowerCase()
          .includes(
            query.toLowerCase(),
          ),
    );

  return (
    <>
      <PageTitle
        eyebrow="Knowledge base"
        title="Notes"
        desc="Founder instructions, meeting notes, SOPs and ideas in one place."
        action={
          <button
            className="btn btn-primary"
            onClick={() =>
              setEditing({
                id: uid(),
                title: '',
                body: '',
                tag: 'General',
                pinned: false,
                updated:
                  today(),
              })
            }
          >
            New note
          </button>
        }
      />

      <div className="notes-grid">
        {filtered.map(
          (note) => (
            <div
              className={
                'card note-card ' +
                (note.pinned
                  ? 'pinned'
                  : '')
              }
              key={
                note.id
              }
            >
              <div className="note-top">
                <Badge tone="purple">
                  {
                    note.tag
                  }
                </Badge>

                <button
                  className="icon-btn small"
                  onClick={() =>
                    setNotes(
                      (items) =>
                        items.map(
                          (
                            item,
                          ) =>
                            item.id ===
                            note.id
                              ? {
                                  ...item,
                                  pinned:
                                    !item.pinned,
                                }
                              : item,
                        ),
                    )
                  }
                >
                  <Tag size={15} />
                </button>
              </div>

              <h3>
                {note.title}
              </h3>

              <p>
                {note.body}
              </p>

              <div className="note-footer">
                <small>
                  {
                    note.updated
                  }
                </small>

                <button
                  className="link"
                  onClick={() =>
                    setEditing(
                      note,
                    )
                  }
                >
                  Edit
                </button>

                <button
                  className="link danger"
                  onClick={() =>
                    setNotes(
                      (items) =>
                        items.filter(
                          (
                            item,
                          ) =>
                            item.id !==
                            note.id,
                        ),
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      {editing && (
        <NoteModal
          note={editing}
          onClose={() =>
            setEditing(null)
          }
          onSave={(note) => {
            setNotes(
              (items) =>
                items.some(
                  (item) =>
                    item.id ===
                    note.id,
                )
                  ? items.map(
                      (item) =>
                        item.id ===
                        note.id
                          ? note
                          : item,
                    )
                  : [
                      note,
                      ...items,
                    ],
            );

            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function NoteModal({
  note,
  onClose,
  onSave,
}: {
  note: Note;
  onClose: () => void;
  onSave: (
    note: Note,
  ) => void;
}) {
  const [currentNote, setCurrentNote] =
    useState<Note>(
      note,
    );

  return (
    <Modal
      title={
        note.title
          ? 'Edit note'
          : 'New note'
      }
      onClose={onClose}
    >
      <label>
        Title

        <input
          className="input"
          value={
            currentNote.title
          }
          onChange={(
            event,
          ) =>
            setCurrentNote({
              ...currentNote,
              title:
                event.target
                  .value,
            })
          }
        />
      </label>

      <label>
        Tag

        <input
          className="input"
          value={
            currentNote.tag
          }
          onChange={(
            event,
          ) =>
            setCurrentNote({
              ...currentNote,
              tag:
                event.target
                  .value,
            })
          }
        />
      </label>

      <label>
        Note

        <textarea
          className="textarea"
          rows={8}
          value={
            currentNote.body
          }
          onChange={(
            event,
          ) =>
            setCurrentNote({
              ...currentNote,
              body:
                event.target
                  .value,
            })
          }
        />
      </label>

      <div className="modal-actions">
        <span />

        <button
          className="btn"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          onClick={() =>
            onSave({
              ...currentNote,
              updated:
                today(),
            })
          }
        >
          Save note
        </button>
      </div>
    </Modal>
  );
}

/* =========================================================
   REPORTS
========================================================= */

function Reports({
  tasks,
  projects,
  orders,
  issues,
  campaigns,
  experiments,
}: {
  tasks: Task[];
  projects: Project[];
  orders: Order[];
  issues: Issue[];
  campaigns: Campaign[];
  experiments: Experiment[];
}) {
  const completed =
    tasks.filter(
      (task) =>
        task.status ===
        'Done',
    ).length;

  const blocked =
    tasks.filter(
      (task) =>
        task.status ===
        'Blocked',
    ).length;

  const revenue =
    orders.reduce(
      (sum, order) =>
        sum + order.amount,
      0,
    );

  return (
    <>
      <PageTitle
        eyebrow="Founder reporting"
        title="Reports"
        desc="A concise operating view for daily and weekly reporting."
        action={
          <button
            className="btn"
            onClick={() =>
              window.print()
            }
          >
            Print report
          </button>
        }
      />

      <div className="report-grid">
        <div className="card report-card">
          <div className="eyebrow">
            DAILY REPORT
          </div>

          <h3>
            Today
          </h3>

          <div className="report-row">
            <span>
              Tasks completed
            </span>

            <b>
              {completed}
            </b>
          </div>

          <div className="report-row">
            <span>
              Tasks pending
            </span>

            <b>
              {
                tasks.filter(
                  (task) =>
                    ![
                      'Done',
                      'Cancelled',
                    ].includes(
                      task.status,
                    ),
                ).length
              }
            </b>
          </div>

          <div className="report-row">
            <span>
              Blocked tasks
            </span>

            <b>
              {blocked}
            </b>
          </div>

          <div className="report-row">
            <span>
              Important issues
            </span>

            <b>
              {
                issues.filter(
                  (issue) =>
                    issue.status ===
                    'Open',
                ).length
              }
            </b>
          </div>
        </div>

        <div className="card report-card">
          <div className="eyebrow">
            WEEKLY SNAPSHOT
          </div>

          <h3>
            Operating pulse
          </h3>

          <div className="report-row">
            <span>
              Active projects
            </span>

            <b>
              {
                projects.filter(
                  (project) =>
                    project.status ===
                    'Active',
                ).length
              }
            </b>
          </div>

          <div className="report-row">
            <span>
              RO / order value
            </span>

            <b>
              ₹
              {revenue.toLocaleString(
                'en-IN',
              )}
            </b>
          </div>

          <div className="report-row">
            <span>
              CRM campaigns
            </span>

            <b>
              {
                campaigns.length
              }
            </b>
          </div>

          <div className="report-row">
            <span>
              Growth experiments
            </span>

            <b>
              {
                experiments.length
              }
            </b>
          </div>
        </div>
      </div>

      <div className="card section">
        <SectionHead
          title="Founder report outline"
          icon={FileText}
        />

        <div className="report-outline">
          <div>
            <b>
              1. Completed work
            </b>

            <p>
              Summarize
              completed tasks
              and projects.
            </p>
          </div>

          <div>
            <b>
              2. E-commerce numbers
            </b>

            <p>
              Orders,
              revenue, AOV
              and marketplace
              movement.
            </p>
          </div>

          <div>
            <b>
              3. Operations
            </b>

            <p>
              Waiting orders,
              shipment issues
              and invoice
              issues.
            </p>
          </div>

          <div>
            <b>
              4. CRM & Growth
            </b>

            <p>
              Campaigns,
              experiments,
              results and
              learnings.
            </p>
          </div>

          <div>
            <b>
              5. Next week
            </b>

            <p>
              List the next
              priorities and
              open
              dependencies.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage() {
  return (
    <>
      <PageTitle
        eyebrow="Workspace configuration"
        title="Settings"
        desc="Authentication, data storage and future integrations."
      />

      <div className="settings-grid">
        <div className="card setting-card">
          <div className="setting-icon">
            <Settings size={18} />
          </div>

          <h3>
            Workspace
          </h3>

          <p>
            Impact Water ·
            E-commerce &
            Growth OS
          </p>

          <span className="setting-status">
            Firebase
            Authentication
            active
          </span>
        </div>

        <div className="card setting-card">
          <div className="setting-icon">
            <Zap size={18} />
          </div>

          <h3>
            Integrations
          </h3>

          <p>
            Blinkit, Zepto,
            OmniFlow, WhatsApp
            and website
            integrations are
            intentionally not
            connected yet.
          </p>

          <span className="setting-status">
            Ready for API
            configuration
          </span>
        </div>

        <div className="card setting-card">
          <div className="setting-icon">
            <BriefcaseBusiness
              size={18}
            />
          </div>

          <h3>
            Data
          </h3>

          <p>
            Current workspace
            records are stored
            locally in the
            browser. Firestore
            persistence can be
            connected next.
          </p>

          <span className="setting-status">
            Firestore pending
          </span>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   QUICK ADD
========================================================= */

function QuickAdd({
  onClose,
  setPage,
  setTasks,
  setProjects,
  setOrders,
  setNotes,
  setIssues,
  setCampaigns,
  setExperiments,
}: {
  onClose: () => void;
  setPage: (
    page: string,
  ) => void;
  setTasks: Dispatch<
    SetStateAction<Task[]>
  >;
  setProjects: Dispatch<
    SetStateAction<Project[]>
  >;
  setOrders: Dispatch<
    SetStateAction<Order[]>
  >;
  setNotes: Dispatch<
    SetStateAction<Note[]>
  >;
  setIssues: Dispatch<
    SetStateAction<Issue[]>
  >;
  setCampaigns: Dispatch<
    SetStateAction<Campaign[]>
  >;
  setExperiments: Dispatch<
    SetStateAction<Experiment[]>
  >;
}) {
  const add = (
    type: string,
  ) => {
    if (type === 'Task') {
      setTasks(
        (items) => [
          {
            id: uid(),
            title:
              'New task',
            description:
              '',
            projectId:
              'p1',
            status:
              'To Do',
            priority:
              'Medium',
            due: today(),
            tags: [],
            subtasks: [],
            created:
              today(),
            updated:
              today(),
          },
          ...items,
        ],
      );

      setPage('Tasks');
    }

    if (type === 'Project') {
      setProjects(
        (items) => [
          {
            id: uid(),
            name:
              'New project',
            description:
              '',
            status:
              'Planning',
            priority:
              'Medium',
            category:
              'E-Commerce',
            due: today(),
            goals: '',
          },
          ...items,
        ],
      );

      setPage(
        'Projects',
      );
    }

    if (
      type ===
      'Order / RO'
    ) {
      setOrders(
        (items) => [
          {
            id:
              'RO-' +
              Math.floor(
                Math.random() *
                  9000 +
                  1000,
              ),
            marketplace:
              'Other',
            date: today(),
            product:
              '',
            qty: 0,
            amount: 0,
            invoice:
              'Pending',
            shipment:
              'Not Started',
            overall:
              'New',
            priority:
              'Medium',
            owner: '',
            notes: '',
          },
          ...items,
        ],
      );

      setPage(
        'E-Commerce',
      );
    }

    if (
      type ===
      'CRM Campaign'
    ) {
      setCampaigns(
        (items) => [
          {
            id: uid(),
            name:
              'New campaign',
            type:
              'Reorder',
            audience:
              '',
            start:
              today(),
            end:
              today(),
            status:
              'Idea',
            targeted: 0,
            sent: 0,
            delivered: 0,
            clicks: 0,
            orders: 0,
            revenue: 0,
            notes: '',
            results: '',
            learnings:
              '',
          },
          ...items,
        ],
      );

      setPage('CRM');
    }

    if (
      type ===
      'Growth Experiment'
    ) {
      setExperiments(
        (items) => [
          {
            id: uid(),
            name:
              'New experiment',
            hypothesis:
              '',
            problem:
              '',
            action:
              '',
            channel:
              'Website',
            start:
              today(),
            end:
              today(),
            metric:
              'Orders',
            baseline:
              '',
            target:
              '',
            result:
              '',
            learning:
              '',
            decision:
              'Continue',
          },
          ...items,
        ],
      );

      setPage(
        'Growth',
      );
    }

    if (type === 'Note') {
      setNotes(
        (items) => [
          {
            id: uid(),
            title:
              'New note',
            body: '',
            tag:
              'General',
            pinned:
              false,
            updated:
              today(),
          },
          ...items,
        ],
      );

      setPage(
        'Notes',
      );
    }

    if (type === 'Issue') {
      setIssues(
        (items) => [
          {
            id: uid(),
            title:
              'New operational issue',
            order: '',
            category:
              'Internal',
            owner: '',
            priority:
              'Medium',
            status:
              'Open',
            due: today(),
            resolution:
              '',
            notes: '',
          },
          ...items,
        ],
      );

      setPage(
        'Operations',
      );
    }

    onClose();
  };

  return (
    <div className="quick-menu">
      <div className="quick-menu-card">
        <div className="modal-head">
          <div>
            <b>
              Quick add
            </b>

            <small>
              Create something
              without leaving
              your workflow.
            </small>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {[
          'Task',
          'Project',
          'Order / RO',
          'CRM Campaign',
          'Growth Experiment',
          'Note',
          'Issue',
        ].map(
          (item) => (
            <button
              className="quick-option"
              key={item}
              onClick={() =>
                add(item)
              }
            >
              <Plus size={17} />

              <span>
                {item}
              </span>

              <ChevronDown
                size={15}
              />
            </button>
          ),
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="modal">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <b>
              {title}
            </b>

            <small>
              Changes are saved
              to this workspace.
            </small>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function Login({
  email,
  password,
  setEmail,
  setPassword,
  authError,
  onLogin,
}: {
  email: string;
  password: string;
  setEmail: (
    value: string,
  ) => void;
  setPassword: (
    value: string,
  ) => void;
  authError: string;
  onLogin: () => void;
}) {
  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="logo-mark">
            IW
          </div>

          <div>
            <div className="login-brand-name">
              Impact Water
            </div>

            <div className="login-brand-subtitle">
              E-commerce & Growth
              OS
            </div>
          </div>
        </div>

        <div className="login-heading">
          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to continue
            to your workspace.
          </p>
        </div>

        <form
          onSubmit={(
            event,
          ) => {
            event.preventDefault();
            onLogin();
          }}
          className="login-form"
        >
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
              placeholder="you@impactwater.in"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(
                event,
              ) =>
                setPassword(
                  event.target
                    .value,
                )
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {authError && (
            <div className="login-error">
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
          >
            Sign in
          </button>
        </form>

        <div className="login-footer">
          Internal Impact
          Water workspace
        </div>
      </div>
    </main>
  );
}
