-- Trigger para crear perfil automáticamente cuando se crea un usuario
-- Ejecuta este SQL en el SQL Editor de Supabase

-- Función que se ejecutará cuando se cree un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (
    id, 
    nombre_completo, 
    departamento,
    cargo,
    fecha_ingreso
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario'),
    NULLIF(NEW.raw_user_meta_data->>'departamento', '')::TEXT,
    NULLIF(NEW.raw_user_meta_data->>'cargo', '')::TEXT,
    CURRENT_DATE
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre_completo = COALESCE(EXCLUDED.nombre_completo, perfiles.nombre_completo),
    departamento = COALESCE(EXCLUDED.departamento, perfiles.departamento),
    cargo = COALESCE(EXCLUDED.cargo, perfiles.cargo);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se dispara cuando se crea un usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
