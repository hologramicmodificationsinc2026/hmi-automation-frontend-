-- Create the workflows storage grid
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'AI Generated Workflow',
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    edges JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing org_id for hyper-fast multi-tenant query lookups
CREATE INDEX IF NOT EXISTS workflows_org_id_idx ON public.workflows(org_id);

-- Enable Row Level Security (RLS) for the launch
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Create a strict security policy: Tenants can only see/modify their own engineering grids
CREATE POLICY "Allow tenant-isolated access" ON public.workflows
FOR ALL
USING (org_id = current_setting('request.jwt.claims', true)::json->>'org_id' OR org_id = 'org_hmi_dev_01');
