
-- Roles enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Security definer role check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security updates table
CREATE TABLE public.security_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package TEXT NOT NULL,
  ecosystem TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.security_updates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_updates TO authenticated;
GRANT ALL ON public.security_updates TO service_role;

ALTER TABLE public.security_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view security updates"
  ON public.security_updates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert security updates"
  ON public.security_updates FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update security updates"
  ON public.security_updates FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete security updates"
  ON public.security_updates FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER security_updates_set_updated_at
  BEFORE UPDATE ON public.security_updates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX security_updates_created_at_idx ON public.security_updates (created_at DESC);
CREATE INDEX security_updates_ecosystem_idx ON public.security_updates (ecosystem);
CREATE INDEX security_updates_package_idx ON public.security_updates (package);

-- Realtime
ALTER TABLE public.security_updates REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_updates;
