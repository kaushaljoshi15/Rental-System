-- Enable pg_trgm extension for fuzzy matching / typo tolerance
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN trigram indexes for fast similarity searches
CREATE INDEX IF NOT EXISTS "product_name_trgm_idx" ON "Product" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "product_description_trgm_idx" ON "Product" USING gin ("description" gin_trgm_ops);
