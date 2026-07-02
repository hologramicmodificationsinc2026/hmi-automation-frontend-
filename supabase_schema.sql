-- ==========================================
-- 1. CORE MULTI-TENANT TABLES
-- ==========================================

-- Every business using the platform gets an isolated workspace account
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Connects a Supabase Auth user to an organization/tenant account
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (org_id, user_id)
);

-- Stores the exact canvas layouts (nodes and edges arrays)
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL DEFAULT 'Untitled Workflow',
    description TEXT,
    is_active BOOLEAN DEFAULT false NOT NULL,
    nodes JSONB DEFAULT '[]'::jsonb NOT NULL,
    edges JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tracks live automation executions and payload histories
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL, -- 'success', 'failed', 'running'
    payload_received JSONB DEFAULT '{}'::jsonb,
    execution_steps JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 2. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Security Rules
CREATE POLICY "Users can view their own memberships" 
ON organization_members FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their organization" 
ON organizations FOR SELECT 
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.org_id = organizations.id AND organization_members.user_id = auth.uid()));

CREATE POLICY "Users can manage workflows in their organization" 
ON workflows FOR ALL 
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.org_id = workflows.org_id AND organization_members.user_id = auth.uid()));

CREATE POLICY "Users can view execution logs in their organization" 
ON workflow_executions FOR SELECT 
USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.org_id = workflow_executions.org_id AND organization_members.user_id = auth.uid()));
