-- Tabela Bankrolls
CREATE TABLE IF NOT EXISTS public.bankrolls (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    initial_value NUMERIC DEFAULT 0,
    auto_bet BOOLEAN DEFAULT false,
    auto_bet_value_enabled BOOLEAN DEFAULT false,
    auto_bet_odd_enabled BOOLEAN DEFAULT false,
    auto_bet_unit TEXT,
    auto_bet_house_enabled BOOLEAN DEFAULT false,
    auto_bet_sport_enabled BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela Sport Mappings
CREATE TABLE IF NOT EXISTS public.sport_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    keyword TEXT NOT NULL,
    sport TEXT NOT NULL,
    type TEXT DEFAULT 'sport' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela Bets
CREATE TABLE IF NOT EXISTS public.bets (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    bankroll_id TEXT REFERENCES public.bankrolls(id),
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    cotacao NUMERIC NOT NULL,
    valor NUMERIC NOT NULL,
    status TEXT NOT NULL,
    type TEXT NOT NULL,
    subtype TEXT NOT NULL,
    title TEXT,
    bookmaker TEXT,
    sport TEXT,
    comment TEXT,
    has_deposited BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionando coluna retroativa para bets existentes (se já existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bets' AND column_name='has_deposited') THEN
        ALTER TABLE public.bets ADD COLUMN has_deposited BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Ativar Row Level Security (RLS)
ALTER TABLE public.bankrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Policies para Bankrolls
DROP POLICY IF EXISTS "Permitir tudo para dono - bankrolls" ON public.bankrolls;
CREATE POLICY "Permitir tudo para dono - bankrolls" ON public.bankrolls 
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Permitir leitura publica - bankrolls" ON public.bankrolls;
CREATE POLICY "Permitir leitura publica - bankrolls" ON public.bankrolls 
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Permitir leitura admin - bankrolls" ON public.bankrolls;
CREATE POLICY "Permitir leitura admin - bankrolls" ON public.bankrolls 
    FOR SELECT USING ((auth.jwt() ->> 'email') = 'thiagofilipepsi@gmail.com');

-- Policies para Sport Mappings
DROP POLICY IF EXISTS "Permitir tudo para dono - sport_mappings" ON public.sport_mappings;
CREATE POLICY "Permitir tudo para dono - sport_mappings" ON public.sport_mappings 
    FOR ALL USING (auth.uid() = user_id);

-- Policies para Bets
DROP POLICY IF EXISTS "Permitir tudo para dono - bets" ON public.bets;
CREATE POLICY "Permitir tudo para dono - bets" ON public.bets 
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Permitir leitura publica - bets" ON public.bets;
CREATE POLICY "Permitir leitura publica - bets" ON public.bets 
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.bankrolls 
        WHERE public.bankrolls.id = bets.bankroll_id 
        AND public.bankrolls.is_public = true
      )
    );

DROP POLICY IF EXISTS "Permitir leitura admin - bets" ON public.bets;
CREATE POLICY "Permitir leitura admin - bets" ON public.bets 
    FOR SELECT USING ((auth.jwt() ->> 'email') = 'thiagofilipepsi@gmail.com');

-- Garantir acesso
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Tabela de Configurações do App (Para updates)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latest_version TEXT NOT NULL DEFAULT '1.0.0',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura app_settings" ON public.app_settings;
CREATE POLICY "Permitir leitura app_settings" ON public.app_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir update admin - app_settings" ON public.app_settings;
CREATE POLICY "Permitir update admin - app_settings" ON public.app_settings
    FOR ALL USING ((auth.jwt() ->> 'email') = 'thiagofilipepsi@gmail.com');

-- Inserir linha inicial de configuração
INSERT INTO public.app_settings (latest_version) 
SELECT EXTRACT(EPOCH FROM now())::text
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- Habilitar Realtime para as tabelas
BEGIN;
  -- Remove as tabelas da publicação se já existirem (evita erro)
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.bankrolls, public.bets, public.app_settings;
COMMIT;

-- Opcional: Melhora o Realtime para Deletions
ALTER TABLE public.bankrolls REPLICA IDENTITY FULL;
ALTER TABLE public.bets REPLICA IDENTITY FULL;
ALTER TABLE public.app_settings REPLICA IDENTITY FULL;

