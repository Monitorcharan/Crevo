import { getSavedCreatorIds } from './creatorService.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Fallback demo briefs for offline or non-authenticated views
const DEMO_BRIEFS = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    brand_id: '00000000-0000-0000-0000-000000000002',
    title: 'Hyperion Apex: 30s Next-Gen Autonomous Hypercar Launch',
    brand_name: 'Lumina Creative Studio',
    description: 'High-octane commercial teaser highlighting aerodynamic carbon fiber surfacing, fluid photorealistic reflections, and futuristic telemetry in neon Tokyo rain.',
    creative_objective: 'Drive viral brand awareness for automotive launch with cinematic hyper-stylized realism.',
    content_type: 'Video',
    visual_style: 'Cyberpunk Hyper-Realism / Anamorphic Cinema',
    aspect_ratio: '16:9',
    duration: '30 seconds',
    ai_tools_preferred: ['Runway Gen-3', 'Midjourney v6', 'ComfyUI', 'Topaz Video AI'],
    deliverables: ['4K ProRes 422 Master Cut', '9:16 Vertical Reel Multi-Crop', 'Clean Broadcast Stills'],
    budget_min: 5000,
    budget_max: 8500,
    currency: 'USD',
    deadline: '2026-11-15T00:00:00Z',
    commercial_use_requirements: 'Full worldwide buyout across broadcast, digital paid ads, and social.',
    licensing_expectations: 'Exclusive perpetual commercial buyout.',
    revision_expectations: '2 rounds of motion pacing and camera motion refinements.',
    status: 'published',
    created_at: '2026-10-09T08:00:00Z',
    updated_at: '2026-10-09T08:00:00Z',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    brand_id: '00000000-0000-0000-0000-000000000002',
    title: 'Aura Botanica: Organic Cellular Luxury Skincare Campaign',
    brand_name: 'Aura Botanica Labs',
    description: 'Macro microscopic botanical visuals showing rare alpine moss cellular regeneration, silky emulsion droplets, and minimalist Scandinavian aesthetic.',
    creative_objective: 'Establish premium scientific authority and organic elegance for luxury skincare line.',
    content_type: 'Advertisement',
    visual_style: 'Minimalist Scandinavian Clean / Macro Organic 3D',
    aspect_ratio: '4:5',
    duration: '15 seconds',
    ai_tools_preferred: ['Midjourney v6', 'Kling AI', 'Magnific AI'],
    deliverables: ['High-Res Key Visuals', '15s Looping Micro-Animation', 'Social Cutdowns'],
    budget_min: 3200,
    budget_max: 4800,
    currency: 'USD',
    deadline: '2026-11-28T00:00:00Z',
    commercial_use_requirements: 'Digital global usage across e-commerce, Instagram, and TikTok.',
    licensing_expectations: 'Non-exclusive commercial buyout with 2-year rights.',
    revision_expectations: '3 revision cycles for color temperature matching.',
    status: 'published',
    created_at: '2026-10-09T08:30:00Z',
    updated_at: '2026-10-09T08:30:00Z',
  },
];

// Fallback demo applications
const DEMO_APPLICATIONS = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    brief_id: 'b1000000-0000-0000-0000-000000000001',
    creator_id: '00000000-0000-0000-0000-000000000001',
    creator_name: 'Elena Vance',
    creator_title: 'AI Cinema Director & Generative Worldbuilder',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    cover_letter: 'I have developed specialized custom LoRAs for hyper-reflective metallic car paint and high-speed anamorphic bokeh. My workflow integrates Runway Gen-3 with custom ComfyUI control networks for precise camera velocity control.',
    proposed_rate: 6500,
    estimated_timeline: '12 business days',
    portfolio_sample_urls: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80'],
    status: 'shortlisted',
    created_at: '2026-10-09T09:00:00Z',
    brief_title: 'Hyperion Apex: 30s Next-Gen Autonomous Hypercar Launch',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    brief_id: 'b1000000-0000-0000-0000-000000000001',
    creator_id: '00000000-0000-0000-0000-000000000003',
    creator_name: 'Marcus Sterling',
    creator_title: 'Commercial Generative Art Director',
    creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    cover_letter: 'Experienced commercial director with 4+ automotive CGI-AI campaigns completed. I deliver full commercial clearance and seed provenance logs.',
    proposed_rate: 5500,
    estimated_timeline: '14 business days',
    portfolio_sample_urls: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'],
    status: 'pending',
    created_at: '2026-10-09T09:15:00Z',
    brief_title: 'Hyperion Apex: 30s Next-Gen Autonomous Hypercar Launch',
  },
];

/**
 * Fetch briefs with optional status filter.
 */
export async function getBriefs({ status = null, limit = 20, offset = 0 } = {}) {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', String(limit));
    params.append('offset', String(offset));

    const response = await fetch(`${API_BASE_URL}/api/briefs?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        briefs: data.items || [],
        totalCount: data.total || 0,
        source: 'backend',
      };
    }
  } catch (err) {
    console.info(`[Crevo] Backend briefs unreachable (${err.message}). Using demo fallback.`);
  }

  let filtered = [...DEMO_BRIEFS];
  if (status) {
    filtered = filtered.filter((b) => b.status === status);
  }
  return {
    briefs: filtered,
    totalCount: filtered.length,
    source: 'demo-fallback',
  };
}

/**
 * Fetch a single brief by ID.
 */
export async function getBriefById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/briefs/${id}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.info(`[Crevo] Backend brief fetch for ${id} failed (${err.message}). Using fallback.`);
  }

  const found = DEMO_BRIEFS.find((b) => b.id === id);
  if (found) return found;
  throw new Error(`Creative brief with ID "${id}" not found.`);
}

/**
 * Create a new creative brief.
 */
export async function createBrief(token, briefData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/briefs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(briefData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create creative brief');
    }

    return await response.json();
  } catch (err) {
    // If backend is unavailable, mock create for demo
    if (err.message.includes('Failed to fetch')) {
      const newBrief = {
        ...briefData,
        id: `mock-${Date.now()}`,
        brand_id: '00000000-0000-0000-0000-000000000002',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      DEMO_BRIEFS.unshift(newBrief);
      return newBrief;
    }
    throw err;
  }
}

/**
 * Update an existing creative brief.
 */
export async function updateBrief(token, id, updateData) {
  const response = await fetch(`${API_BASE_URL}/api/briefs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update brief');
  }

  return await response.json();
}

/**
 * Delete a creative brief.
 */
export async function deleteBrief(token, id) {
  const response = await fetch(`${API_BASE_URL}/api/briefs/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete brief');
  }

  return true;
}

/**
 * Generate structured brief with AI.
 */
export async function generateAIBrief(prompt, brandName = null) {
  const response = await fetch(`${API_BASE_URL}/api/ai/generate-brief`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      brand_name: brandName,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate brief with AI');
  }

  return await response.json();
}

/**
 * Get explainable creator recommendations for a brief.
 */
export async function getBriefRecommendations(briefId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/briefs/${briefId}/recommendations`, {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return data.recommendations || [];
    }
  } catch (err) {
    console.info(`[Crevo] Recommendations fetch failed: ${err.message}.`);
  }

  // Fallback heuristic recommendations
  return [
    {
      creator_id: '00000000-0000-0000-0000-000000000001',
      display_name: 'Elena Vance',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      headline: 'AI Cinema Director & Generative Worldbuilder',
      specialization: 'AI Filmmaking',
      ai_tools: ['Runway Gen-3', 'Midjourney v6', 'ComfyUI'],
      skills: ['Cinematic Direction', 'Motion Prompting', 'Color Grading'],
      score: 92.5,
      match_reasons: [
        'Matches primary specialization: AI Filmmaking',
        'Direct tool match for: Runway Gen-3, Midjourney v6, ComfyUI',
        'Demonstrated portfolio format: video',
      ],
      score_breakdown: {
        specialization: 35.0,
        tools: 25.0,
        skills: 15.0,
        portfolio_format: 17.5,
      },
    },
    {
      creator_id: '00000000-0000-0000-0000-000000000003',
      display_name: 'Marcus Sterling',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      headline: 'Commercial Generative Art Director',
      specialization: 'Product Ads',
      ai_tools: ['Midjourney v6', 'Kling AI', 'Magnific AI'],
      skills: ['Product Photorealism', 'Lighting Simulation'],
      score: 84.0,
      match_reasons: [
        'Matches commercial advertising format',
        'Direct tool match for: Midjourney v6',
        'High commercial clearance provenance rating',
      ],
      score_breakdown: {
        specialization: 28.0,
        tools: 20.0,
        skills: 18.0,
        portfolio_format: 18.0,
      },
    },
  ];
}

/**
 * Apply to a creative brief as a creator.
 */
export async function applyToBrief(token, briefId, applicationData) {
  const response = await fetch(`${API_BASE_URL}/api/briefs/${briefId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(applicationData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit application');
  }

  return await response.json();
}

/**
 * Get applications for a specific brief (Brand Director view).
 */
export async function getBriefApplications(token, briefId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/briefs/${briefId}/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.items || [];
    }
  } catch (err) {
    console.info(`[Crevo] Failed to fetch applications for brief ${briefId}: ${err.message}`);
  }

  return DEMO_APPLICATIONS.filter((a) => a.brief_id === briefId);
}

/**
 * Get all applications for the current creator.
 */
export async function getMyApplications(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/creators/me/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.items || [];
    }
  } catch (err) {
    console.info(`[Crevo] Failed to fetch my applications: ${err.message}`);
  }

  return DEMO_APPLICATIONS;
}

/**
 * Update application status (shortlist / accept / reject).
 */
export async function updateApplicationStatus(token, applicationId, status) {
  const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update application status');
  }

  return await response.json();
}

/**
 * Get aggregated brand metrics.
 */
export async function getBrandDashboardData(token) {
  const [briefsRes, appsRes] = await Promise.allSettled([
    getBriefs({ limit: 50 }),
    // Fetch apps for the first brief if available
    getBriefApplications(token, 'b1000000-0000-0000-0000-000000000001'),
  ]);

  const briefs = briefsRes.status === 'fulfilled' ? briefsRes.value.briefs : DEMO_BRIEFS;
  const applications = appsRes.status === 'fulfilled' ? appsRes.value : DEMO_APPLICATIONS;
  const savedCreatorIds = getSavedCreatorIds();

  const activeBriefsCount = briefs.filter((b) => b.status === 'published').length;
  const completedProjectsCount = 3; // Seed metric

  return {
    metrics: {
      activeBriefs: activeBriefsCount,
      totalApplications: applications.length,
      savedCreators: savedCreatorIds.length || 4,
      completedProjects: completedProjectsCount,
    },
    briefs,
    applications,
  };
}
