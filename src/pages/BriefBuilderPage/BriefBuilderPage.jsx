import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/useAuth.js';
import { createBrief, generateAIBrief } from '../../services/briefService.js';
import './BriefBuilderPage.css';

const CONTENT_TYPES = ['Video', 'Animation', 'Image', 'Advertisement', 'Graphic Design'];
const ASPECT_RATIOS = ['16:9', '9:16', '4:5', '1:1', '2.39:1'];
const POPULAR_AI_TOOLS = [
  'Runway Gen-3',
  'Midjourney v6',
  'ComfyUI',
  'Kling AI',
  'Topaz Video AI',
  'Flux.1',
  'Magnific AI',
  'Luma Dream Machine',
];
const SAMPLE_PROMPTS = [
  'Create a cinematic 30-second advertisement for a futuristic electric scooter in rain-soaked Neo-Tokyo.',
  'Design an ultra-clean Scandinavian macro campaign for an organic moss cellular serum.',
  'Produce a high-energy hyper-stylized AI animated music video sequence with surreal physics.',
];

export default function BriefBuilderPage() {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Wizard Step: 1, 2, 3, 4
  const [currentStep, setCurrentStep] = useState(1);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiBannerVisible, setAiBannerVisible] = useState(true);
  const [aiNote, setAiNote] = useState('');

  // Step 1: Project Overview
  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState(user?.displayName || 'Lumina Creative Studio');
  const [description, setDescription] = useState('');
  const [creativeObjective, setCreativeObjective] = useState('');

  // Step 2: Creative Requirements
  const [contentType, setContentType] = useState('Video');
  const [visualStyle, setVisualStyle] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState('30 seconds');
  const [aiToolsPreferred, setAiToolsPreferred] = useState(['Runway Gen-3', 'Midjourney v6']);
  const [customToolInput, setCustomToolInput] = useState('');
  const [deliverables, setDeliverables] = useState([
    '4K UHD Master Cut',
    '9:16 Vertical Reel Social Multi-Crop',
  ]);
  const [customDeliverableInput, setCustomDeliverableInput] = useState('');

  // Step 3: Commercial Requirements
  const [budgetMin, setBudgetMin] = useState(4000);
  const [budgetMax, setBudgetMax] = useState(7500);
  const [currency] = useState('USD');
  const [deadline, setDeadline] = useState('');
  const [commercialUseReqs, setCommercialUseReqs] = useState(
    'Full worldwide commercial IP buyout across broadcast, digital paid media, and social platforms.'
  );
  const [licensingExpectations, setLicensingExpectations] = useState(
    'Perpetual exclusive commercial buyout with complete model seed and training logs.'
  );
  const [revisionExpectations, setRevisionExpectations] = useState(
    'Includes 2 rounds of generative prompt tuning and camera motion refinements.'
  );

  // Submission State
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  // AI Brief Generation Handler
  const handleAIGenerate = async (promptToUse = aiPrompt) => {
    if (!promptToUse.trim()) return;
    setAiLoading(true);
    setErrorMessage('');
    try {
      const generated = await generateAIBrief(promptToUse, brandName);

      if (generated.title) setTitle(generated.title);
      if (generated.description) setDescription(generated.description);
      if (generated.creative_objective) setCreativeObjective(generated.creative_objective);
      if (generated.content_type) setContentType(generated.content_type);
      if (generated.visual_style) setVisualStyle(generated.visual_style);
      if (generated.aspect_ratio) setAspectRatio(generated.aspect_ratio);
      if (generated.duration) setDuration(generated.duration);
      if (generated.ai_tools_preferred?.length) {
        setAiToolsPreferred(generated.ai_tools_preferred);
      }
      if (generated.deliverables?.length) {
        setDeliverables(generated.deliverables);
      }

      setAiNote(
        generated.commercial_guidance_note ||
          'AI generated creative parameters. Commercial terms, budget, and deadlines left for your confirmation.'
      );
    } catch (err) {
      setErrorMessage(`AI brief generation error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Toggle tool
  const toggleTool = (tool) => {
    setAiToolsPreferred((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const addCustomTool = (e) => {
    e.preventDefault();
    if (customToolInput.trim() && !aiToolsPreferred.includes(customToolInput.trim())) {
      setAiToolsPreferred([...aiToolsPreferred, customToolInput.trim()]);
      setCustomToolInput('');
    }
  };

  // Add / remove deliverable
  const addDeliverable = (e) => {
    e.preventDefault();
    if (customDeliverableInput.trim()) {
      setDeliverables([...deliverables, customDeliverableInput.trim()]);
      setCustomDeliverableInput('');
    }
  };

  const removeDeliverable = (index) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  // Validation function
  const validateForm = () => {
    const errors = [];
    if (!title.trim()) errors.push('Project title is required (Step 1)');
    if (!brandName.trim()) errors.push('Brand name is required (Step 1)');
    if (!description.trim()) errors.push('Project description is required (Step 1)');
    if (!creativeObjective.trim()) errors.push('Creative objective is required (Step 1)');
    if (!visualStyle.trim()) errors.push('Visual style specification is required (Step 2)');
    if (deliverables.length === 0) errors.push('At least one deliverable is required (Step 2)');
    if (budgetMin <= 0 || budgetMax <= 0 || budgetMin > budgetMax) {
      errors.push('Valid minimum and maximum budget range is required (Step 3)');
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Submission handler
  const handleSubmit = async (publishStatus = 'published') => {
    if (publishStatus === 'published' && !validateForm()) {
      setCurrentStep(4);
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const payload = {
      title,
      brand_name: brandName,
      description,
      creative_objective: creativeObjective,
      content_type: contentType,
      visual_style: visualStyle || 'Cinematic Hyper-Realism',
      aspect_ratio: aspectRatio,
      duration: duration || null,
      ai_tools_preferred: aiToolsPreferred,
      deliverables,
      budget_min: Number(budgetMin),
      budget_max: Number(budgetMax),
      currency,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      commercial_use_requirements: commercialUseReqs,
      licensing_expectations: licensingExpectations,
      revision_expectations: revisionExpectations,
      status: publishStatus,
    };

    try {
      await createBrief(token, payload);
      navigate('/dashboard/brand');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save creative brief');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="brief-builder-page">
      <div className="container brief-builder__container">
        {/* Header Breadcrumbs */}
        <div className="brief-builder__nav-row">
          <Link to="/dashboard/brand" className="brief-builder__back-link">
            &larr; Back to Brand Dashboard
          </Link>
          <div className="brief-builder__mode-chip">Enterprise Creative Brief Builder</div>
        </div>

        {/* AI Assistance Top Bar */}
        {aiBannerVisible && (
          <motion.div
            className="ai-brief-banner"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="ai-brief-banner__header">
              <div className="ai-brief-banner__sparkle">✦</div>
              <div>
                <h2 className="ai-brief-banner__title">Generate Structured Brief with AI</h2>
                <p className="ai-brief-banner__desc">
                  Provide a creative concept prompt. Crevo&apos;s AI brief engine will synthesize
                  cinematic requirements and recommended toolchains while leaving commercial terms
                  for your confirmation.
                </p>
              </div>
              <button
                type="button"
                className="ai-brief-banner__dismiss"
                onClick={() => setAiBannerVisible(false)}
                title="Dismiss AI Assistant"
              >
                ✕
              </button>
            </div>

            <div className="ai-brief-banner__input-group">
              <input
                type="text"
                placeholder='e.g. "Create a cinematic 30-second advertisement for a futuristic electric scooter."'
                className="ai-brief-banner__input"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAIGenerate();
                  }
                }}
              />
              <button
                type="button"
                className="button button--primary ai-brief-banner__btn"
                disabled={aiLoading || !aiPrompt.trim()}
                onClick={() => handleAIGenerate()}
              >
                {aiLoading ? 'Synthesizing...' : 'Synthesize with AI'}
              </button>
            </div>

            {/* Quick Inspiration Prompts */}
            <div className="ai-brief-banner__quick-prompts">
              <span className="quick-label">Try prompt:</span>
              {SAMPLE_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-prompt-btn"
                  onClick={() => {
                    setAiPrompt(promptText);
                    handleAIGenerate(promptText);
                  }}
                >
                  &ldquo;{promptText.slice(0, 48)}...&rdquo;
                </button>
              ))}
            </div>

            {aiNote && (
              <div className="ai-brief-banner__note" role="note">
                <span className="note-icon">ℹ</span>
                <span>{aiNote}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Wizard Progress Stepper */}
        <div className="brief-stepper" role="navigation" aria-label="Brief Steps">
          <div className="brief-stepper__track">
            {[
              { num: 1, label: 'Project Overview' },
              { num: 2, label: 'Creative Requirements' },
              { num: 3, label: 'Commercial Terms' },
              { num: 4, label: 'Review & Publish' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  className={`brief-stepper__step ${isActive ? 'active' : ''} ${isPast ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(step.num)}
                >
                  <div className="brief-stepper__circle">
                    {isPast ? '✓' : step.num}
                  </div>
                  <span className="brief-stepper__label">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Body */}
        <div className="brief-wizard-card">
          {errorMessage && (
            <div className="brief-wizard__error-banner" role="alert">
              ✕ {errorMessage}
            </div>
          )}

          {/* STEP 1: Project Overview */}
          {currentStep === 1 && (
            <motion.div
              className="brief-step-content"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="brief-step-content__header">
                <h2>Step 1: Project Overview</h2>
                <p>Define the core narrative identity and creative mandate for your brief.</p>
              </div>

              <div className="brief-field-group">
                <label className="brief-label" htmlFor="brief-title">
                  Project Title <span className="req">*</span>
                </label>
                <input
                  id="brief-title"
                  type="text"
                  required
                  placeholder="e.g. Hyperion Apex: 30s Next-Gen Autonomous Hypercar Launch"
                  className="brief-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="brief-field-group">
                <label className="brief-label" htmlFor="brand-name">
                  Brand / Studio Name <span className="req">*</span>
                </label>
                <input
                  id="brand-name"
                  type="text"
                  required
                  placeholder="e.g. Lumina Creative Studio"
                  className="brief-input"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>

              <div className="brief-field-group">
                <label className="brief-label" htmlFor="brief-desc">
                  Project Description <span className="req">*</span>
                </label>
                <textarea
                  id="brief-desc"
                  rows={4}
                  required
                  placeholder="Describe the aesthetic universe, context, key scenes, and emotional resonance expected from the creator..."
                  className="brief-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="brief-field-group">
                <label className="brief-label" htmlFor="brief-objective">
                  Creative Objective <span className="req">*</span>
                </label>
                <textarea
                  id="brief-objective"
                  rows={3}
                  required
                  placeholder="What is the commercial or artistic goal? (e.g. Drive viral pre-orders, establish luxury skincare authority...)"
                  className="brief-textarea"
                  value={creativeObjective}
                  onChange={(e) => setCreativeObjective(e.target.value)}
                />
              </div>

              <div className="brief-step-actions">
                <span className="step-count">Step 1 of 4</span>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => setCurrentStep(2)}
                >
                  Continue to Creative Requirements &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Creative Requirements */}
          {currentStep === 2 && (
            <motion.div
              className="brief-step-content"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="brief-step-content__header">
                <h2>Step 2: Creative Requirements</h2>
                <p>Specify media formats, aspect ratios, visual aesthetics, and preferred generative toolchains.</p>
              </div>

              {/* Content Type Selector */}
              <div className="brief-field-group">
                <label className="brief-label">Content Type <span className="req">*</span></label>
                <div className="brief-pills-row">
                  {CONTENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`brief-pill-btn ${contentType === type ? 'active' : ''}`}
                      onClick={() => setContentType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Style */}
              <div className="brief-field-group">
                <label className="brief-label" htmlFor="visual-style">
                  Visual Style &amp; Art Direction <span className="req">*</span>
                </label>
                <input
                  id="visual-style"
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Hyper-Realism / Anamorphic Cinema Bokeh"
                  className="brief-input"
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                />
              </div>

              {/* Aspect Ratio & Duration */}
              <div className="brief-grid-2">
                <div className="brief-field-group">
                  <label className="brief-label">Aspect Ratio</label>
                  <div className="brief-pills-row">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        className={`brief-pill-btn ${aspectRatio === ratio ? 'active' : ''}`}
                        onClick={() => setAspectRatio(ratio)}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="brief-field-group">
                  <label className="brief-label" htmlFor="brief-duration">Duration (where applicable)</label>
                  <input
                    id="brief-duration"
                    type="text"
                    placeholder="e.g. 30 seconds / Master Cut"
                    className="brief-input"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

              {/* Preferred AI Tools */}
              <div className="brief-field-group">
                <label className="brief-label">Preferred Generative AI Toolchains</label>
                <div className="brief-pills-row">
                  {POPULAR_AI_TOOLS.map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      className={`brief-pill-btn ${aiToolsPreferred.includes(tool) ? 'active' : ''}`}
                      onClick={() => toggleTool(tool)}
                    >
                      {aiToolsPreferred.includes(tool) ? '✓ ' : '+ '}
                      {tool}
                    </button>
                  ))}
                </div>

                <form onSubmit={addCustomTool} className="brief-custom-add-row">
                  <input
                    type="text"
                    placeholder="Add custom model or LoRA (e.g. Custom Flux LoRA)..."
                    className="brief-input brief-input--sm"
                    value={customToolInput}
                    onChange={(e) => setCustomToolInput(e.target.value)}
                  />
                  <button type="submit" className="button button--secondary button--sm">
                    Add Tool
                  </button>
                </form>
              </div>

              {/* Deliverables */}
              <div className="brief-field-group">
                <label className="brief-label">Expected Deliverables <span className="req">*</span></label>
                <div className="brief-tags-list">
                  {deliverables.map((deliv, index) => (
                    <span key={index} className="brief-tag-item">
                      {deliv}
                      <button
                        type="button"
                        className="brief-tag-del"
                        onClick={() => removeDeliverable(index)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={addDeliverable} className="brief-custom-add-row">
                  <input
                    type="text"
                    placeholder="e.g. 4K ProRes Master Cut, Frame Seed Files..."
                    className="brief-input brief-input--sm"
                    value={customDeliverableInput}
                    onChange={(e) => setCustomDeliverableInput(e.target.value)}
                  />
                  <button type="submit" className="button button--secondary button--sm">
                    + Add Deliverable
                  </button>
                </form>
              </div>

              <div className="brief-step-actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setCurrentStep(1)}
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => setCurrentStep(3)}
                >
                  Continue to Commercial Terms &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Commercial Requirements */}
          {currentStep === 3 && (
            <motion.div
              className="brief-step-content"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="brief-step-content__header">
                <h2>Step 3: Commercial Requirements &amp; Legal IP</h2>
                <p>Define budgets, commercial clearance expectations, licensing rights, and delivery timelines.</p>
              </div>

              {/* Budget Range */}
              <div className="brief-grid-2">
                <div className="brief-field-group">
                  <label className="brief-label" htmlFor="budget-min">
                    Minimum Budget (USD) <span className="req">*</span>
                  </label>
                  <input
                    id="budget-min"
                    type="number"
                    min="100"
                    step="100"
                    required
                    className="brief-input"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                </div>

                <div className="brief-field-group">
                  <label className="brief-label" htmlFor="budget-max">
                    Maximum Budget (USD) <span className="req">*</span>
                  </label>
                  <input
                    id="budget-max"
                    type="number"
                    min="100"
                    step="100"
                    required
                    className="brief-input"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className="brief-field-group">
                <label className="brief-label" htmlFor="brief-deadline">Production Deadline</label>
                <input
                  id="brief-deadline"
                  type="date"
                  className="brief-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              {/* Commercial Use Requirements */}
              <div className="brief-field-group">
                <label className="brief-label" htmlFor="commercial-reqs">
                  Commercial-Use Requirements <span className="req">*</span>
                </label>
                <textarea
                  id="commercial-reqs"
                  rows={2}
                  className="brief-textarea"
                  value={commercialUseReqs}
                  onChange={(e) => setCommercialUseReqs(e.target.value)}
                />
              </div>

              {/* Licensing Expectations */}
              <div className="brief-field-group">
                <label className="brief-label" htmlFor="licensing-exp">
                  Licensing Expectations <span className="req">*</span>
                </label>
                <textarea
                  id="licensing-exp"
                  rows={2}
                  className="brief-textarea"
                  value={licensingExpectations}
                  onChange={(e) => setLicensingExpectations(e.target.value)}
                />
              </div>

              {/* Revision Expectations */}
              <div className="brief-field-group">
                <label className="brief-label" htmlFor="revision-exp">
                  Revision Expectations <span className="req">*</span>
                </label>
                <textarea
                  id="revision-exp"
                  rows={2}
                  className="brief-textarea"
                  value={revisionExpectations}
                  onChange={(e) => setRevisionExpectations(e.target.value)}
                />
              </div>

              <div className="brief-step-actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setCurrentStep(2)}
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => {
                    validateForm();
                    setCurrentStep(4);
                  }}
                >
                  Review &amp; Finalize Brief &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Review and Publish */}
          {currentStep === 4 && (
            <motion.div
              className="brief-step-content"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="brief-step-content__header">
                <h2>Step 4: Review and Publish</h2>
                <p>Inspect the complete creative brief before broadcasting to Crevo creators.</p>
              </div>

              {/* Validation Warning Box if any */}
              {validationErrors.length > 0 && (
                <div className="brief-validation-box" role="alert">
                  <div className="brief-validation-box__title">
                    ⚠ Please resolve the following required fields before publishing:
                  </div>
                  <ul>
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Card */}
              <div className="brief-preview-card">
                <div className="brief-preview-card__header">
                  <div>
                    <span className="brief-preview-tag">Preview Draft</span>
                    <h3 className="brief-preview-title">{title || 'Untitled Creative Brief'}</h3>
                    <p className="brief-preview-brand">Commissioned by {brandName}</p>
                  </div>
                  <div className="brief-preview-budget">
                    <span className="budget-val">
                      ${Number(budgetMin).toLocaleString()} &ndash; ${Number(budgetMax).toLocaleString()} {currency}
                    </span>
                    <span className="budget-label">COMMERCIAL BUDGET</span>
                  </div>
                </div>

                <div className="brief-preview-body">
                  <div className="preview-section">
                    <span className="preview-label">Creative Mandate</span>
                    <p>{description || 'No project description entered yet.'}</p>
                  </div>

                  <div className="preview-section">
                    <span className="preview-label">Creative Objective</span>
                    <p>{creativeObjective || 'No objective specified.'}</p>
                  </div>

                  <div className="preview-meta-grid">
                    <div>
                      <span className="preview-label">Content Type</span>
                      <p>{contentType}</p>
                    </div>
                    <div>
                      <span className="preview-label">Visual Style</span>
                      <p>{visualStyle || 'Not defined'}</p>
                    </div>
                    <div>
                      <span className="preview-label">Aspect Ratio &amp; Duration</span>
                      <p>{aspectRatio} &bull; {duration || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="preview-label">Deadline</span>
                      <p>{deadline ? new Date(deadline).toLocaleDateString() : 'Rolling Application'}</p>
                    </div>
                  </div>

                  <div className="preview-section">
                    <span className="preview-label">AI Toolchain</span>
                    <div className="tools-pills">
                      {aiToolsPreferred.map((t) => (
                        <span key={t} className="tool-pill">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="preview-section">
                    <span className="preview-label">Deliverables Required</span>
                    <ul className="preview-deliverables-list">
                      {deliverables.map((deliv, idx) => (
                        <li key={idx}>✓ {deliv}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="preview-section preview-section--legal">
                    <span className="preview-label">Commercial IP Buyout Terms</span>
                    <p><strong>Usage:</strong> {commercialUseReqs}</p>
                    <p><strong>Licensing:</strong> {licensingExpectations}</p>
                    <p><strong>Revisions:</strong> {revisionExpectations}</p>
                  </div>
                </div>
              </div>

              {/* Publish / Save Actions */}
              <div className="brief-step-actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setCurrentStep(3)}
                >
                  &larr; Back to Terms
                </button>

                <div className="brief-action-buttons">
                  <button
                    type="button"
                    className="button button--secondary"
                    disabled={saving}
                    onClick={() => handleSubmit('draft')}
                  >
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    className="button button--primary"
                    disabled={saving}
                    onClick={() => handleSubmit('published')}
                  >
                    {saving ? 'Publishing...' : 'Publish Creative Brief (POST /api/briefs)'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
