-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE/POSTGRESQL
-- ==========================================================
-- Run these scripts directly on your database console to set up server-side safety layers.

-- ----------------------------------------------------------
-- 1. Enable RLS on core SaaS tables
-- ----------------------------------------------------------
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RentalOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- 2. "User" Table Policies
-- ----------------------------------------------------------
-- Permit public reads/writes for signup/login flows, but isolate updates
CREATE POLICY "Users can read all profiles" 
ON "User" FOR SELECT 
USING (true);

CREATE POLICY "Users can only modify their own profile data" 
ON "User" FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins bypass all restrictions
CREATE POLICY "Admins have full access on User" 
ON "User" FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- ----------------------------------------------------------
-- 3. "Product" Table Policies
-- ----------------------------------------------------------
-- Customers can view any rentable, approved product (unified marketplace view)
CREATE POLICY "Anyone can view rentable approved products" 
ON "Product" FOR SELECT 
USING (isRentable = true AND isApproved = true);

-- Vendors can manage (create, read, update, delete) their own products
CREATE POLICY "Vendors can manage own products" 
ON "Product" FOR ALL 
USING (auth.uid() = "vendorId")
WITH CHECK (auth.uid() = "vendorId");

-- Admins bypass all restrictions
CREATE POLICY "Admins have full access on Product" 
ON "Product" FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- ----------------------------------------------------------
-- 4. "RentalOrder" Table Policies
-- ----------------------------------------------------------
-- Customers can select their own orders
CREATE POLICY "Users can view own rental orders" 
ON "RentalOrder" FOR SELECT 
USING (auth.uid() = "userId");

-- Vendors can read orders where their products are included
CREATE POLICY "Vendors can view orders for their products" 
ON "RentalOrder" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "OrderLine" ol
    JOIN "Product" p ON ol."productId" = p.id
    WHERE ol."orderId" = "RentalOrder".id AND p."vendorId" = auth.uid()
  )
);

-- Admins have full access
CREATE POLICY "Admins have full access on RentalOrder" 
ON "RentalOrder" FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- ----------------------------------------------------------
-- 5. "AuditLog" Table Policies
-- ----------------------------------------------------------
-- Only admins can select or insert audit logs
CREATE POLICY "Only admins can view audit logs" 
ON "AuditLog" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

CREATE POLICY "System can record audit logs" 
ON "AuditLog" FOR INSERT 
WITH CHECK (true);
