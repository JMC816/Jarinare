-- 기존 admin 역할을 super_admin으로 마이그레이션
UPDATE users SET role = 'super_admin' WHERE role = 'admin';
