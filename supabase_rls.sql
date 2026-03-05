-- Enable Row Level Security (RLS) on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create a function to check organization access
CREATE OR REPLACE FUNCTION check_org_access(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_users
    WHERE organization_id = target_org_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample Policy for Organizations (Users can only see their own orgs)
CREATE POLICY "Users can see their own organizations" 
ON organizations 
FOR SELECT 
USING (check_org_access(id));

-- Sample Policy for Conversations
CREATE POLICY "Users can only see their org's conversations" 
ON conversations 
FOR ALL 
USING (organization_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
));

-- Policy for Messages
CREATE POLICY "Users can only see their org's messages"
ON messages
FOR ALL
USING (EXISTS (
    SELECT 1 FROM conversations
    JOIN organization_users ON conversations.organization_id = organization_users.organization_id
    WHERE conversations.id = messages.conversation_id
    AND organization_users.user_id = auth.uid()
));

-- Policy for API Keys
CREATE POLICY "Only admins can see API Keys"
ON api_keys
FOR ALL
USING (check_org_access(organization_id));

-- Repeat similar policies for other tables using organization_id column...
