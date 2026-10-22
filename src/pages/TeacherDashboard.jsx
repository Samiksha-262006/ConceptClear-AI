import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { teacherApi, analyticsApi } from '../api/client';
import {
  Users,
  Calendar,
  FileCheck,
  TrendingUp,
  Plus,
  Download,
  AlertTriangle,
  Clock,
  Eye,
  Loader2,
  X,
  ShieldAlert,
  CheckCircle2,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  Lock
} from 'lucide-react';

export function TeacherDashboard() {
  const { user, showToast } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'students' | 'tests' | 'analytics'
  const [activeTab, setActiveTab] = useState('students');

  // Student Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('All');

  // Test Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    instructions: '',
    subject: 'Mathematics',
    target_class: 'Class 10',
    duration_minutes: 20,
    enable_tab_monitoring: true,
    tab_switch_threshold: 3,
    release_results: true,
    start_time: '',
    end_time: ''
  });
  const [creating, setCreating] = useState(false);

  // Submissions Audit Modal
  const [selectedTestSubmissions, setSelectedTestSubmissions] = useState(null);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const [overviewData, testsData, studentsData] = await Promise.all([
        analyticsApi.getTeacherOverview(),
        teacherApi.getTests(),
        teacherApi.getStudents().catch(() => [])
      ]);
      setAnalytics(overviewData);
      setTests(testsData || []);
      setStudents(studentsData.length > 0 ? studentsData : (overviewData.all_students || []));
    } catch (err) {
      console.error('Failed to load teacher data:', err);
      showToast('Failed to load classroom analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScheduleForClass = (targetClass = 'Class 10') => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const formatForInput = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setCreateForm({
      title: `${targetClass} Assessment — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      instructions: `Please answer all questions carefully. This test is restricted exclusively to students in ${targetClass}. Tab switching is monitored.`,
      subject: 'Mathematics',
      target_class: targetClass === 'All' ? 'Class 10' : targetClass,
      duration_minutes: 20,
      enable_tab_monitoring: true,
      tab_switch_threshold: 3,
      release_results: true,
      start_time: formatForInput(now),
      end_time: formatForInput(nextWeek)
    });
    setShowCreateModal(true);
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      showToast('Please enter a test title.', 'warning');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        ...createForm,
        start_time: createForm.start_time ? new Date(createForm.start_time).toISOString() : null,
        end_time: createForm.end_time ? new Date(createForm.end_time).toISOString() : null
      };

      await teacherApi.createTest(payload);
      showToast(`Exam scheduled exclusively for ${createForm.target_class}!`, 'success');
      setShowCreateModal(false);
      loadTeacherData();
    } catch (err) {
      console.error('Failed to create test:', err);
      showToast(err.message || 'Failed to create test.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleViewSubmissions = async (testId) => {
    setSubmissionsLoading(true);
    try {
      const res = await teacherApi.getTestSubmissions(testId);
      setSelectedTestSubmissions(res);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      showToast(err.message || 'Failed to load test submissions.', 'error');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleExportCsv = (testId) => {
    const url = teacherApi.getExportCsvUrl(testId);
    window.open(url, '_blank');
  };

  // Filtered Students List
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSession =
      selectedSessionFilter === 'All' ||
      (s.academic_level && s.academic_level.toLowerCase() === selectedSessionFilter.toLowerCase());

    return matchesSearch && matchesSession;
  });

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={36} color="var(--secondary-violet)" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading student cohort details & test scheduling engine...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, var(--navy-900) 60%, var(--secondary-violet) 100%)',
          color: '#FFFFFF',
          border: 'none',
          padding: '2rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', marginBottom: '0.5rem' }}>
            {user?.school || 'Mathematics & Science Department'}
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Classroom & Student Cohort Dashboard 👩‍🏫
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '0.95rem', maxWidth: '640px' }}>
            Review all enrolled student profiles, inspect mastery bottlenecks, and schedule proctored exams locked strictly to specific academic sessions.
          </p>
        </div>

        <button
          className="btn btn-accent btn-lg"
          onClick={() => handleOpenScheduleForClass('Class 10')}
          style={{ background: '#FFFFFF', color: 'var(--navy-900)', border: 'none', fontWeight: 700 }}
        >
          <Plus size={18} /> Schedule New Test
        </button>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-4" style={{ gap: '1.25rem' }}>
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Total Enrolled Students</div>
            <div className="kpi-value">{students.length || analytics?.total_students || 0}</div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--primary-blue-light)' }}>
            <Users size={24} color="var(--primary-blue)" />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Tests Scheduled</div>
            <div className="kpi-value">{tests.length || analytics?.tests_scheduled || 0}</div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--secondary-violet-light)' }}>
            <Calendar size={24} color="var(--secondary-violet)" />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Submissions Completed</div>
            <div className="kpi-value">{analytics?.tests_completed || 0}</div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--success-green-light)' }}>
            <FileCheck size={24} color="var(--success-green)" />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Class Performance Avg</div>
            <div className="kpi-value">{Math.round(analytics?.average_class_performance || 0)}%</div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--warning-amber-light)' }}>
            <TrendingUp size={24} color="var(--warning-amber)" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', maxWidth: '620px' }}>
        <button
          className="btn"
          onClick={() => setActiveTab('students')}
          style={{
            flex: 1,
            background: activeTab === 'students' ? 'var(--primary-blue)' : 'transparent',
            color: activeTab === 'students' ? '#FFFFFF' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 700
          }}
        >
          <Users size={16} /> All Students ({students.length})
        </button>

        <button
          className="btn"
          onClick={() => setActiveTab('tests')}
          style={{
            flex: 1,
            background: activeTab === 'tests' ? 'var(--primary-blue)' : 'transparent',
            color: activeTab === 'tests' ? '#FFFFFF' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 700
          }}
        >
          <Calendar size={16} /> Scheduled Tests ({tests.length})
        </button>

        <button
          className="btn"
          onClick={() => setActiveTab('analytics')}
          style={{
            flex: 1,
            background: activeTab === 'analytics' ? 'var(--primary-blue)' : 'transparent',
            color: activeTab === 'analytics' ? '#FFFFFF' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 700
          }}
        >
          <AlertTriangle size={16} /> Cognitive Gaps
        </button>
      </div>

      {/* TAB 1: ALL STUDENTS DIRECTORY & SCHEDULE BUTTON */}
      {activeTab === 'students' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                Enrolled Students Cohort
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Comprehensive list of all students across academic sessions with mastery metrics and quick test scheduling.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', width: '220px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.85rem' }}
                />
                <Search
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>

              {/* Academic Session Filter */}
              <div className="flex items-center gap-2">
                <Filter size={15} color="var(--primary-blue)" />
                <select
                  className="form-select"
                  value={selectedSessionFilter}
                  onChange={(e) => setSelectedSessionFilter(e.target.value)}
                  style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '130px' }}
                >
                  <option value="All">All Classes</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenScheduleForClass(selectedSessionFilter === 'All' ? 'Class 10' : selectedSessionFilter)}
              >
                <Plus size={14} /> Schedule for {selectedSessionFilter === 'All' ? 'Class' : selectedSessionFilter}
              </button>
            </div>
          </div>

          {/* Students Data Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Details</th>
                  <th>Academic Session</th>
                  <th>Concept Mastery</th>
                  <th>Tests Attempted</th>
                  <th>Proctoring Alerts</th>
                  <th>Status</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar-letter" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                            {(s.name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{s.name}</div>
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{s.academic_level || 'Class 10'}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: 800 }}>{s.avg_mastery}%</span>
                          <div style={{ width: 60, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${s.avg_mastery}%`,
                                backgroundColor:
                                  s.avg_mastery >= 75
                                    ? 'var(--success-green)'
                                    : s.avg_mastery >= 40
                                    ? 'var(--warning-amber)'
                                    : 'var(--danger-red)',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {s.tests_completed || 0} / {s.tests_attempted || 0}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${s.flagged_tests > 0 ? 'badge-gap' : 'badge-mastered'}`}>
                          {s.flagged_tests > 0 ? `⚠️ ${s.flagged_tests} Flagged` : 'Clean'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${s.status === 'Needs Attention' ? 'badge-gap' : 'badge-mastered'}`}>
                          {s.status || 'On Track'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.775rem', padding: '0.3rem 0.65rem' }}
                          onClick={() => handleOpenScheduleForClass(s.academic_level || 'Class 10')}
                        >
                          <Plus size={12} /> Schedule for {s.academic_level || 'Class'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No students found matching your search or academic session filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULED TESTS TABLE */}
      {activeTab === 'tests' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                Scheduled Curriculum Tests
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Manage examinations, view session access restrictions, and export proctoring audit trails.
              </p>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => handleOpenScheduleForClass('Class 10')}>
              <Plus size={16} /> Schedule New Test
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Target Session (Gated)</th>
                  <th>Duration</th>
                  <th>Tab Limit</th>
                  <th>Submissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{t.title}</td>
                    <td>{t.subject || 'Mathematics'}</td>
                    <td>
                      <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12} /> {t.target_class || 'Class 10'} Only
                      </span>
                    </td>
                    <td>{t.duration_minutes} Mins</td>
                    <td>
                      <span className="badge badge-unassessed">Max {t.tab_switch_threshold || 3}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{t.submissions_count || t.attempts_count || 0}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewSubmissions(t.id)}
                        >
                          <Eye size={14} /> Submissions
                        </button>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleExportCsv(t.id)}
                          title="Download CSV"
                        >
                          <Download size={14} /> CSV
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COGNITIVE GAPS & MISCONCEPTIONS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-2" style={{ gap: '1.5rem' }}>
          {/* Concepts Needing Attention */}
          <div className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  Curriculum Bottlenecks ⚠️
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Concepts where multiple students exhibit unmastered prerequisite gaps.
                </p>
              </div>
              <span className="badge badge-gap">Priority Remediation</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analytics?.concepts_needing_attention && analytics.concepts_needing_attention.length > 0 ? (
                analytics.concepts_needing_attention.map((c, idx) => (
                  <div
                    key={idx}
                    className="concept-item-card"
                    style={{ borderLeft: '4px solid var(--danger-red)' }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--danger-red)', fontWeight: 600 }}>
                        {c.students_with_gaps} student(s) with identified gaps
                      </div>
                    </div>
                    <span className="badge badge-gap">{Math.round(c.avg_mastery)}% Avg</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  All curriculum concepts have healthy class-wide mastery!
                </p>
              )}
            </div>
          </div>

          {/* Top Misconceptions Distribution */}
          <div className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  Classroom-Wide Misconceptions 🧠
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Most triggered distractor patterns across student attempts.
                </p>
              </div>
              <span className="badge badge-practice">Error Frequency</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analytics?.top_classroom_misconceptions && analytics.top_classroom_misconceptions.length > 0 ? (
                analytics.top_classroom_misconceptions.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem 1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-primary)',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy-900)' }}>
                        {m.name || m.code}
                      </span>
                      <span className="badge badge-gap">{m.occurrences || m.frequency} triggers</span>
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      {m.description || 'Students apply direct whole-number logic to rational operations.'}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  No prevalent misconception clusters recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE TEST MODAL WITH TARGET ACADEMIC SESSION GATING */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-primary">Session-Gated Assessment</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
                  Schedule Examination for Specific Session
                </h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCreateModal(false)}
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Explanatory Notice */}
            <div style={{ background: 'var(--primary-blue-light)', borderLeft: '4px solid var(--primary-blue)', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--navy-900)' }}>
              🔒 <strong>Session-Gating Active:</strong> This test will only appear for and be accessible by students enrolled in the selected academic session/class below.
            </div>

            <form onSubmit={handleCreateTest}>
              <div className="form-group">
                <label className="form-label">Examination Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Class 10 Mid-Term Diagnostic — Algebra"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  required
                />
              </div>

              {/* Target Academic Session / Class (KEY USER REQUIREMENT) */}
              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>
                    🎯 Target Academic Session / Class
                  </label>
                  <select
                    className="form-select"
                    value={createForm.target_class}
                    onChange={(e) => setCreateForm({ ...createForm, target_class: e.target.value })}
                    style={{ borderColor: 'var(--primary-blue)', fontWeight: 700, backgroundColor: '#F0F9FF' }}
                  >
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="College Undergraduate">College Undergrad</option>
                    <option value="All Classes">All Classes (Universal)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
              </div>

              {/* Duration and Tab Switch Limit */}
              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Duration (Minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="5"
                    max="180"
                    value={createForm.duration_minutes}
                    onChange={(e) => setCreateForm({ ...createForm, duration_minutes: parseInt(e.target.value, 10) || 20 })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tab Switch Threshold (Max Allowed)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="10"
                    value={createForm.tab_switch_threshold}
                    onChange={(e) => setCreateForm({ ...createForm, tab_switch_threshold: parseInt(e.target.value, 10) || 3 })}
                  />
                </div>
              </div>

              {/* Start & End Date Time Picker */}
              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={createForm.start_time}
                    onChange={(e) => setCreateForm({ ...createForm, start_time: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deadline / End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={createForm.end_time}
                    onChange={(e) => setCreateForm({ ...createForm, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Instructions for Students</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Answer all questions carefully. Tab monitoring is active."
                  value={createForm.instructions}
                  onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
                />
              </div>

              <div className="grid grid-2" style={{ gap: '1rem', marginTop: '0.5rem' }}>
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={createForm.enable_tab_monitoring}
                    onChange={(e) => setCreateForm({ ...createForm, enable_tab_monitoring: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Enable Proctoring Monitoring</span>
                </label>

                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={createForm.release_results}
                    onChange={(e) => setCreateForm({ ...createForm, release_results: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Release Results Instantly</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem', fontSize: '1rem' }}
              >
                {creating ? 'Publishing & Gating Test...' : `Publish Test for ${createForm.target_class}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBMISSIONS AUDIT MODAL */}
      {selectedTestSubmissions && (
        <div className="modal-backdrop" onClick={() => setSelectedTestSubmissions(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-primary">Submissions & Integrity Audit</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
                  {selectedTestSubmissions.test?.title}
                </h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedTestSubmissions(null)}
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="table-container" style={{ maxHeight: '420px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Tab Switches</th>
                    <th>Integrity Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTestSubmissions.attempts && selectedTestSubmissions.attempts.length > 0 ? (
                    selectedTestSubmissions.attempts.map((a, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{a.student_name}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{a.student_email}</td>
                        <td>{a.score} / {a.total_marks}</td>
                        <td>
                          <span className={`badge ${a.percentage >= 60 ? 'badge-mastered' : 'badge-gap'}`}>
                            {Math.round(a.percentage)}%
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: a.tab_switch_count > 0 ? 'var(--danger-red)' : 'var(--success-green)' }}>
                          {a.tab_switch_count} switches
                        </td>
                        <td>
                          <span className={`badge ${a.is_flagged ? 'badge-gap' : 'badge-mastered'}`}>
                            {a.is_flagged ? '⚠️ Flagged Violation' : 'Verified Clean'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                        No students have submitted this test yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
