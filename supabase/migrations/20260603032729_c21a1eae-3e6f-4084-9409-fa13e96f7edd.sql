CREATE TABLE public.ai_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  provider text NOT NULL,
  api_key text NOT NULL,
  model text,
  is_primary boolean NOT NULL DEFAULT false,
  last4 text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_connections TO authenticated;
GRANT ALL ON public.ai_connections TO service_role;

ALTER TABLE public.ai_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ai connections"
ON public.ai_connections FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai connections"
ON public.ai_connections FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai connections"
ON public.ai_connections FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai connections"
ON public.ai_connections FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE UNIQUE INDEX ai_connections_one_primary
ON public.ai_connections (user_id) WHERE is_primary;

CREATE TRIGGER update_ai_connections_updated_at
BEFORE UPDATE ON public.ai_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.ai_connections (user_id, provider, api_key, model, is_primary, last4)
SELECT user_id, ai_provider, api_key, model, true, RIGHT(api_key, 4)
FROM public.user_settings
WHERE ai_provider IS NOT NULL
  AND ai_provider <> 'nixoia'
  AND api_key IS NOT NULL
  AND api_key <> ''
ON CONFLICT (user_id, provider) DO NOTHING;