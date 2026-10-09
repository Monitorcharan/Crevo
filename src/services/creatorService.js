import { MOCK_CREATORS } from '../data/mockCreators.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const SAVED_STORAGE_KEY = 'crevo_saved_creators';

/**
 * Normalizes creator record whether retrieved from FastAPI or mock data.
 */
function normalizeCreator(raw) {
  if (!raw) return null;
  return {
    id: raw.id || raw.user_id,
    user_id: raw.user_id || raw.id,
    name: raw.display_name || raw.name || 'AI Creator',
    handle: raw.handle || `@${(raw.display_name || raw.name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
    avatar: raw.avatar_url || raw.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: raw.cover_url || raw.coverImage || '/creators/cyber_city.jpg',
    title: raw.headline || raw.title || 'Generative Director',
    specialization: raw.specialization || 'AI Art',
    bio: raw.bio || '',
    fullBio: raw.fullBio || raw.bio || '',
    skills: raw.skills || [],
    tools: raw.ai_tools || raw.tools || [],
    availability: raw.availability || 'Available Now',
    availabilityStatus: raw.availability === 'Available Now' ? 'available' : 'booking',
    location: raw.location || 'Global',
    rating: raw.rating || 5.0,
    reviewsCount: raw.reviews_count || raw.reviewsCount || 0,
    projectsCount: raw.projects_count || raw.projectsCount || 0,
    startingPrice: raw.starting_price || raw.startingPrice || 1500,
    priceUnit: raw.price_unit || raw.priceUnit || 'project',
    experienceYears: raw.experienceYears || 3,
    verification: raw.verification || {
      isDemo: true,
      badgeLabel: 'Demo Verified Creator',
      identityStatus: 'Government ID & Biometric Match Verified',
      portfolioStatus: 'Original Project Files & Seed Logs Inspected',
      toolProficiency: 'Mastery Demonstrated in Runway Gen-3 & ComfyUI',
      completedProjects: raw.projects_count || 12,
      inspectionDate: 'October 2026',
      note: 'Demo data representing Crevo Trust & Safety verification protocol.',
    },
    workflow: raw.workflow || [
      { step: 1, title: 'Concepting & Narrative Breakdown', desc: 'Developing mood boards, style parameters, and character turnaround sheets.' },
      { step: 2, title: 'Generative Synthesis', desc: 'Multi-model diffusion prompting in Runway, Midjourney, and custom LoRA graphs.' },
      { step: 3, title: 'Upscaling & Color Grade', desc: 'Frame interpolation, Topaz 4K mastering, and broadcast-grade color timing.' },
    ],
    commercialTerms: raw.commercialTerms || {
      rights: 'Full worldwide commercial IP buyout included upon delivery.',
      compliance: 'All training base models are commercially cleared with complete provenance logs.',
      revisions: 'Includes 2 rounds of generative iteration and camera adjustment.',
    },
    portfolioItems: (raw.portfolio_items || raw.portfolioItems || []).map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle || p.title,
      type: p.type || (p.media_type === 'video' ? 'Cinematic Video' : p.media_type === 'ad' ? 'Product Ads' : 'AI Art'),
      mediaType: p.media_type || p.mediaType || 'image',
      image: p.media_url || p.image || '/creators/film_sci_fi.jpg',
      aspectRatio: p.aspectRatio || '16:9',
      duration: p.duration || 'Master Cut',
      year: p.year || '2026',
      description: p.description || '',
      toolsUsed: p.tools_used || p.toolsUsed || [],
      generationParams: p.generationParams || 'Resolution: 3840x2160, CFG Scale: 7.0, Seed Locked',
      workflow: p.workflow_description || p.workflow || 'Multi-model diffusion synthesis pipeline.',
      humanContribution: p.humanContribution || 'Art direction, prompt design, camera choreography, and final color mastering.',
      deliverables: p.deliverables || ['4K UHD Master', 'Social Multi-Crops'],
      hasCommercialPermission: p.commercial_use_status === 'cleared' || Boolean(p.hasCommercialPermission),
      commercialLicense: p.commercialLicense || (p.commercial_use_status === 'cleared'
        ? 'Full worldwide commercial IP buyout included.'
        : 'Commercial rights not provided. Personal research archive.'),
    })),
  };
}

/**
 * Fetch creators from FastAPI backend with query filters and pagination,
 * falling back to local demo seed dataset if the backend is unreachable.
 */
export async function getCreators({
  search = '',
  specialization = 'All',
  tool = 'All',
  contentType = 'All',
  experience = 'All',
  availability = 'All',
  sortBy = 'relevance',
  limit = 20,
  offset = 0,
} = {}) {
  try {
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (specialization !== 'All') params.append('specialization', specialization);
    if (tool !== 'All') params.append('tool', tool);
    if (availability !== 'All') params.append('availability', availability);
    params.append('limit', String(limit));
    params.append('offset', String(offset));

    const response = await fetch(`${API_BASE_URL}/api/creators?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        creators: data.items.map(normalizeCreator),
        totalCount: data.total,
        source: 'backend',
      };
    }
  } catch (err) {
    console.info(`[Crevo] Backend at ${API_BASE_URL} unreachable (${err.message}). Using local demo seed dataset.`);
  }

  // Fallback: Local Demo Seed Dataset
  let results = [...MOCK_CREATORS];

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchBio = c.bio.toLowerCase().includes(q);
      const matchSpec = c.specialization.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchSkills = c.skills.some((s) => s.toLowerCase().includes(q));
      const matchTools = c.tools.some((t) => t.toLowerCase().includes(q));
      return matchName || matchBio || matchSpec || matchTitle || matchSkills || matchTools;
    });
  }

  if (specialization && specialization !== 'All') {
    results = results.filter((c) => c.specialization === specialization);
  }

  if (tool && tool !== 'All') {
    results = results.filter((c) => c.tools.includes(tool));
  }

  if (contentType && contentType !== 'All') {
    results = results.filter((c) => c.contentType === contentType);
  }

  if (experience && experience !== 'All') {
    results = results.filter((c) => c.experienceLevel === experience);
  }

  if (availability && availability !== 'All') {
    results = results.filter((c) => c.availability === availability);
  }

  if (sortBy === 'experience') {
    results.sort((a, b) => b.experienceYears - a.experienceYears);
  } else if (sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'projects') {
    results.sort((a, b) => b.projectsCount - a.projectsCount);
  } else {
    results.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
  }

  return {
    creators: results.slice(offset, offset + limit).map(normalizeCreator),
    totalCount: results.length,
    source: 'demo-seed',
  };
}

/**
 * Fetch a single creator by ID or slug.
 */
export async function getCreatorById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/creators/${id}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      return normalizeCreator(data);
    }
  } catch (err) {
    console.info(`[Crevo] Backend fetch for ${id} failed (${err.message}). Using local demo seed.`);
  }

  const found = MOCK_CREATORS.find((c) => c.id === id || c.user_id === id);
  if (found) {
    return normalizeCreator(found);
  }
  throw new Error(`Creator with ID "${id}" not found.`);
}

/**
 * Update authenticated creator profile via PATCH /api/creators/me
 */
export async function updateMyCreatorProfile(token, profileData) {
  const response = await fetch(`${API_BASE_URL}/api/creators/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update profile');
  }

  const data = await response.json();
  return normalizeCreator(data);
}

/**
 * Publish a new portfolio piece via POST /api/portfolio
 */
export async function createPortfolioItem(token, itemData) {
  const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to publish portfolio piece');
  }

  return response.json();
}

/**
 * Delete a portfolio item via DELETE /api/portfolio/:id
 */
export async function deletePortfolioItem(token, itemId) {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/${itemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete portfolio piece');
  }

  return true;
}

/**
 * Saved creators management using localStorage.
 */
export function getSavedCreatorIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSaveCreator(id) {
  const current = getSavedCreatorIds();
  let updated;
  let isSaved = false;

  if (current.includes(id)) {
    updated = current.filter((item) => item !== id);
    isSaved = false;
  } else {
    updated = [...current, id];
    isSaved = true;
  }

  try {
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }

  return { isSaved, savedIds: updated };
}

export function isCreatorSaved(id) {
  return getSavedCreatorIds().includes(id);
}

/**
 * Invite creator to a creative brief.
 */
export async function inviteCreatorToBrief(creatorId, briefPayload) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return {
    success: true,
    invitationId: `inv-${Date.now()}`,
    creatorId,
    briefTitle: briefPayload.title,
    timestamp: new Date().toISOString(),
  };
}
